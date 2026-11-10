import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalUrl, cleanTitle, csvFor, extractFacts, makeReference, mergeCandidates, parseInput, photosFrom, platformFor, publicUrl, readingAllowed, toCandidate } from '../lib.mjs';
import { EXAMPLES } from '../examples.mjs';

test('only public HTTP(S) links without credentials or unusual ports are accepted', () => {
  for (const url of [
    'javascript:alert(1)', 'data:text/html,test', 'file:///etc/passwd', 'https://localhost/a',
    'http://127.0.0.1', 'http://2130706433', 'http://0x7f000001', 'https://[::1]',
    'https://private.internal', 'https://name:password@example.com', 'https://example.com:3000',
    'https://169.254.169.254/', 'not a link',
  ]) assert.equal(publicUrl(url), null, url);
  assert.equal(publicUrl('https://www.villanovo.com/a#photos'), 'https://www.villanovo.com/a');
});

test('deduplication keeps property IDs while removing tracking, fragments and equivalent prefixes', () => {
  assert.equal(canonicalUrl('http://www.example.com/villa/?id=123&utm_source=x#photo'), 'https://example.com/villa?id=123');
  assert.notEqual(canonicalUrl('https://example.com/?id=1'), canonicalUrl('https://example.com/?id=2'));
});

test('platform identity is based on the domain, not a misleading URL substring', () => {
  assert.equal(platformFor('https://www.villanovo.com/a').id, 'villanovo');
  assert.equal(platformFor('https://villanovo.com.example.com/a').id, 'web');
  assert.equal(platformFor('https://example.com/?site=airbnb.com').id, 'web');
});

test('Airbnb reading is disabled across regional domains', () => {
  for (const url of ['https://airbnb.com/rooms/1', 'https://www.airbnb.pt/rooms/1', 'https://www.airbnb.co.uk/rooms/1']) assert.equal(readingAllowed(url), false);
  assert.equal(readingAllowed('https://sondoblons.com/'), true);
});

test('text input, clues and a URL with no scheme are handled explicitly', () => {
  assert.equal(parseInput('www.airbnb.com/rooms/1').sourceUrl, 'https://www.airbnb.com/rooms/1');
  assert.equal(parseInput('Villa Alegria', 'Salema', 'Portugal').text, 'Villa Alegria');
  assert.throws(() => parseInput('javascript:alert(1)'), /public http/);
  assert.throws(() => parseInput(''), /Paste/);
  assert.throws(() => parseInput('ab'), /Add a property/);
  assert.throws(() => parseInput('x'.repeat(1601)), /shorten/);
});

test('unknown URL identity cannot silently become an inferred property', () => {
  assert.throws(() => makeReference(parseInput('https://airbnb.com/rooms/123')), /exact listing/);
  const withClues = makeReference(parseInput('https://airbnb.com/rooms/123', 'Villa Alegria Salema', 'Portugal'));
  assert.match(withClues.query, /Villa Alegria Salema/);
  const fromIndex = makeReference(parseInput('https://example.com/villa'), { title: 'Villa Alegria | Agency', description: 'Salema. 125511/AL.' });
  assert.equal(fromIndex.title, 'Villa Alegria');
  assert.match(fromIndex.query, /125511\/AL/);
  assert.equal(cleanTitle('Son Doblons - Book now'), 'Son Doblons');
});

test('facts remain null if absent, identifiers are preserved and features are only mentions', () => {
  const facts = extractFacts('4 bedrooms, 8 guests, 3.5 bathrooms. 125511 / AL. Pool and sea views.');
  assert.equal(facts.bedrooms, 4);
  assert.equal(facts.guests, 8);
  assert.equal(facts.bathrooms, 3.5);
  assert.deepEqual(facts.registrations, ['125511/AL']);
  assert.ok(facts.features.includes('Pool'));
  assert.equal(extractFacts('A lovely villa').bedrooms, null);
  assert.equal(extractFacts('sleeps 8').guests, 8);
});

test('unsafe candidates and the starting listing are excluded', () => {
  const ref = makeReference(parseInput('https://example.com/original', 'Villa Alegria Salema'));
  assert.equal(toCandidate({ url: 'javascript:alert(1)' }, ref, 'web'), null);
  assert.equal(toCandidate({ url: 'https://www.example.com/original#photos' }, ref, 'web'), null);
  const item = toCandidate({ url: 'https://agency.com/villa', title: 'Villa Alegria Salema' }, ref, 'web');
  assert.equal(item.siteType, 'Unclassified website');
  assert.equal(item.priority, 'Review first');
  assert.ok(item.evidence.some((text) => text.includes('Text overlaps')));
  assert.equal('confidence' in item, false);
});

test('geographic name collisions are flagged rather than considered established matches', () => {
  const ref = makeReference(parseInput('Villa Alegria', '', 'Portugal'));
  const item = toCandidate({ url: 'https://alegriaanguilla.com/', title: 'Villa Alegria Anguilla' }, ref, 'web');
  assert.equal(item.conflicts.length, 1);
});

test('duplicate sources share one candidate and preserve the search provenance', () => {
  const ref = makeReference(parseInput('Villa Alegria Salema'));
  const a = toCandidate({ url: 'https://www.example.com/villa?utm_source=a', title: 'Alegria' }, ref, 'web');
  const b = toCandidate({ url: 'https://example.com/villa', title: 'Alegria' }, ref, 'blackbook');
  const results = mergeCandidates([a, b]);
  assert.equal(results.length, 1);
  assert.deepEqual(results[0].foundIn, ['web', 'blackbook']);
  assert.deepEqual(a.foundIn, ['web']);
});

test('image extraction accepts documented image maps and Markdown, never guesses URLs', () => {
  const photos = photosFrom({
    images: {
      Pool: 'https://cdn.example.com/pool.jpg',
      Logo: 'https://cdn.example.com/logo.png',
      'https://cdn.example.com/terrace.jpg': 'Terrace',
      Unsafe: 'http://127.0.0.1/photo.jpg',
    },
    content: '![Pool](https://cdn.example.com/pool.jpg)\n![Bedroom](https://cdn.example.com/bed.jpg)',
  }, 'https://example.com/villa');
  assert.deepEqual(photos.map((item) => item.url), [
    'https://cdn.example.com/pool.jpg', 'https://cdn.example.com/terrace.jpg', 'https://cdn.example.com/bed.jpg',
  ]);
  assert.ok(photos.every((item) => item.sourceUrl === 'https://example.com/villa'));
  assert.deepEqual(photosFrom({ images: ['javascript:alert(1)'] }, 'https://example.com'), []);
});

test('CSV preserves source mode and neutralizes spreadsheet formulas', () => {
  const candidate = structuredClone(EXAMPLES.portugal.candidates[0]);
  candidate.title = '=HYPERLINK("https://bad.example")';
  const csv = csvFor([candidate]);
  assert.ok(csv.includes(`"'=HYPERLINK(""https://bad.example"")"`));
  assert.ok(csv.includes('"sample"'));
  assert.ok(csv.includes('https://vilavitacollection.com'));
});

test('saved examples are never labelled live or assigned unverified photos', () => {
  for (const example of Object.values(EXAMPLES)) {
    assert.equal(example.mode, 'sample');
    for (const item of example.candidates) {
      assert.equal(item.mode, 'sample');
      assert.deepEqual(item.photos, []);
      assert.equal(item.facts.registrations.length, 0);
    }
  }
});
