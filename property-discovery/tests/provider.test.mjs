import test from 'node:test';
import assert from 'node:assert/strict';
import { JinaClient, ResearchError, research } from '../provider.mjs';
import { parseInput } from '../lib.mjs';

const response = (data) => new Response(JSON.stringify({ code: 200, data }), { headers: { 'Content-Type': 'application/json' } });

test('search key is confined to the Jina authorization header; search does not crawl result pages', async () => {
  let called = false;
  const client = new JinaClient('test-key-not-a-secret', async (url, options) => {
    called = true;
    assert.equal(new URL(url).origin, 'https://s.jina.ai');
    assert.ok(!url.includes('test-key-not-a-secret'));
    assert.equal(options.headers.Authorization, 'Bearer test-key-not-a-secret');
    assert.equal(options.headers['X-Respond-With'], 'no-content');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'no-referrer');
    return response([{ url: 'https://example.com', title: 'Villa' }]);
  });
  assert.equal((await client.search('Villa Salema')).length, 1);
  assert.equal(called, true);
});

test('search without a key fails before any network request', async () => {
  const client = new JinaClient('', () => assert.fail('No request expected'));
  await assert.rejects(client.search('villa'), /Connect your own/);
});

for (const status of [401, 402, 403, 429, 451, 500]) {
  test(`HTTP ${status} is surfaced rather than becoming an empty successful result`, async () => {
    const client = new JinaClient('test-key', async () => new Response('error', { status }));
    await assert.rejects(client.search('villa'), (error) => error instanceof ResearchError && error.status === status);
  });
}

test('network failures, invalid JSON and wrong response shapes remain errors', async () => {
  for (const fetcher of [
    async () => { throw new TypeError('Network failure'); },
    async () => new Response('not json'),
    async () => response({ unrelated: true }),
    async () => response([null]),
    async () => response([{ title: 'No URL' }]),
  ]) await assert.rejects(new JinaClient('test-key', fetcher).search('villa'), ResearchError);
});

test('page reads request robots compliance, validate identity and do not require a key', async () => {
  const client = new JinaClient('', async (url, options) => {
    assert.ok(url.startsWith('https://r.jina.ai/https://example.com/villa'));
    assert.equal(options.headers['X-Robots-Txt'], '*');
    assert.equal(options.headers.Authorization, undefined);
    return response({ url: 'https://example.com/villa', title: 'Villa', content: '4 bedrooms and 8 guests.', images: { Pool: 'https://cdn.example.com/pool.jpg' } });
  });
  const result = await client.read('https://example.com/villa');
  assert.equal(result.facts.bedrooms, 4);
  assert.equal(result.photos.length, 1);
});

test('disallowed sources, redirected pages and challenge pages do not return property data', async () => {
  const forbidden = new JinaClient('', () => assert.fail('No request expected'));
  await assert.rejects(forbidden.read('https://www.airbnb.com/rooms/1'), /disabled/);
  await assert.rejects(forbidden.read('http://localhost'), /disabled/);
  const redirected = new JinaClient('', async () => response({ url: 'https://example.com/login', title: 'Sign in', content: 'login' }));
  await assert.rejects(redirected.read('https://example.com/villa'), /different page/);
  const challenged = new JinaClient('', async () => response({ url: 'https://example.com/villa', title: 'Just a moment', content: 'challenge' }));
  await assert.rejects(challenged.read('https://example.com/villa'), /access check/);
});

test('research searches each chosen source and the broader internet, then deduplicates results', async () => {
  const queries = [];
  const result = await research({
    input: parseInput('Villa Alegria Salema', '', 'Portugal'),
    sources: ['villanovo', 'web'],
    client: { search: async (query) => {
      queries.push(query);
      return [{ url: 'https://www.villanovo.com/villa?utm_source=x', title: 'Villa Alegria', description: 'Salema, 4 bedrooms.' }];
    } },
  });
  assert.equal(queries.length, 2);
  assert.ok(queries.some((query) => query.includes('site:villanovo.com')));
  assert.ok(queries.some((query) => !query.includes('site:')));
  assert.equal(result.candidates.length, 1);
  assert.deepEqual(result.candidates[0].foundIn.sort(), ['villanovo', 'web']);
  assert.equal(result.partial, false);
});

test('URL identification requires an exact indexed URL or explicit user clues', async () => {
  await assert.rejects(research({
    input: parseInput('https://example.com/villa'), sources: ['web'],
    client: { search: async () => [{ url: 'https://other.com/villa', title: 'A different villa' }] },
  }), /exact listing/);
  let calls = 0;
  const result = await research({
    input: parseInput('https://example.com/villa'), sources: ['web'],
    client: { search: async () => {
      calls++;
      return calls === 1 ? [{ url: 'https://example.com/villa', title: 'Villa Alegria | Agency' }] :
        [{ url: 'https://other.com/alegria', title: 'Villa Alegria' }];
    } },
  });
  assert.equal(calls, 2);
  assert.equal(result.reference.title, 'Villa Alegria');
});

test('partial failure preserves successful results and reports failed source coverage', async () => {
  const result = await research({
    input: parseInput('Villa Alegria Salema'), sources: ['web', 'airbnb'],
    client: { search: async (query) => {
      if (query.includes('site:airbnb.com')) throw new ResearchError('Source refused', 403);
      return [{ url: 'https://example.com/villa', title: 'Villa Alegria' }];
    } },
  });
  assert.equal(result.candidates.length, 1);
  assert.equal(result.partial, true);
  assert.equal(result.error, null);
  assert.equal(result.coverage.find((item) => item.id === 'airbnb').state, 'failed');
});

test('a scoped platform search cannot include off-domain candidates', async () => {
  const result = await research({
    input: parseInput('Villa Alegria'), sources: ['villanovo'],
    client: { search: async () => [
      { url: 'https://villanovo.com/a', title: 'Alegria' },
      { url: 'https://other.com/a', title: 'Alegria' },
    ] },
  });
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].platform, 'villanovo');
});

test('authentication failure stops unstarted queries and cannot masquerade as zero matches', async () => {
  let count = 0;
  const result = await research({
    input: parseInput('Villa Alegria Salema'), sources: ['airbnb', 'plum', 'web'],
    client: { search: async () => { count++; throw new ResearchError('Bad key', 401); } },
  });
  assert.equal(count, 2);
  assert.ok(result.error);
  assert.equal(result.coverage.filter((item) => item.state === 'skipped').length, 1);
});

test('a successfully empty index response is distinct from failure', async () => {
  const result = await research({
    input: parseInput('Villa with no indexed matches'), sources: ['web'], client: { search: async () => [] },
  });
  assert.deepEqual(result.candidates, []);
  assert.equal(result.error, null);
  assert.equal(result.partial, false);
  assert.equal(result.coverage[0].state, 'complete');
});

test('cancellation stops work rather than returning a successful partial result', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(research({
    input: parseInput('Villa Alegria'), sources: ['web'], signal: controller.signal,
    client: { search: async () => assert.fail('No request expected') },
  }), { name: 'AbortError' });
});
