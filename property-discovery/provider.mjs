import { PLATFORMS, buildQuery, canonicalUrl, makeReference, mergeCandidates, photosFrom, publicUrl, readingAllowed, toCandidate, extractFacts } from './lib.mjs';

export class ResearchError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ResearchError';
    this.status = status;
  }
}

export class JinaClient {
  constructor(key = '', fetcher = (...args) => globalThis.fetch(...args)) {
    this.key = key.trim();
    this.fetcher = fetcher;
  }

  async request(url, headers, signal) {
    const timeout = AbortSignal.timeout(45000);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    let response;
    try {
      response = await this.fetcher(url, {
        headers: { Accept: 'application/json', ...(this.key ? { Authorization: `Bearer ${this.key}` } : {}), ...headers },
        signal: combined, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store',
      });
    } catch (error) {
      if (signal?.aborted) throw new DOMException('Research cancelled.', 'AbortError');
      if (timeout.aborted) throw new ResearchError('The provider timed out. No result was inferred; try again later.');
      throw new ResearchError(`Could not reach Jina. Check your connection or browser access to the API. ${error instanceof TypeError ? '' : 'The request did not complete.'}`.trim());
    }
    if (!response.ok) {
      const messages = {
        401: 'Jina rejected the API key. Connect a valid key and try again.',
        402: 'The Jina account has insufficient credits. Check your provider account.',
        403: 'Access was refused by the provider or source. No bypass was attempted.',
        429: 'Jina rate-limited the request. Wait before trying again.',
        451: 'This source is unavailable through the provider. No bypass was attempted.',
      };
      throw new ResearchError(messages[response.status] || `The provider returned HTTP ${response.status}. No results were inferred.`, response.status);
    }
    let body;
    try {
      body = await response.json();
    } catch {
      throw new ResearchError('The provider returned an unreadable response, not research results.');
    }
    if (body.code && body.code !== 200) throw new ResearchError('The provider reported an unsuccessful request. Please check the source or your account.', body.code);
    return body.data;
  }

  async search(query, signal) {
    if (!this.key) throw new ResearchError('Connect your own Jina API key to run a live search. The saved examples do not need a key.', 401);
    const url = new URL('https://s.jina.ai/');
    url.searchParams.set('q', query);
    url.searchParams.set('num', '6');
    const data = await this.request(url.href, { 'X-Respond-With': 'no-content', 'X-Robots-Txt': '*' }, signal);
    if (!Array.isArray(data)) throw new ResearchError('The search response did not contain a result list.');
    if (data.some((entry) => !entry || typeof entry !== 'object' || typeof entry.url !== 'string')) {
      throw new ResearchError('The search provider returned malformed result records. No candidates were inferred.');
    }
    return data;
  }

  async read(url, signal) {
    const safe = publicUrl(url);
    if (!safe || !readingAllowed(safe)) throw new ResearchError('Page reading is disabled for this source. Use its indexed result and open the original page instead.');
    const data = await this.request(`https://r.jina.ai/${safe}`, {
      'X-Robots-Txt': '*', 'X-With-Images-Summary': 'true',
      'X-Respond-With': 'markdown', 'X-Max-Tokens': '6000',
    }, signal);
    if (!data || typeof data !== 'object' || typeof data.content !== 'string') throw new ResearchError('No readable public page was returned.');
    if (canonicalUrl(data.url || safe) !== canonicalUrl(safe)) throw new ResearchError('The source redirected to a different page. Its details were not attached to this candidate.');
    if (/captcha|access denied|just a moment|verify you are human/i.test(data.title || '')) throw new ResearchError('The source returned an access check, not property details. No bypass was attempted.');
    return { facts: extractFacts(data.content), photos: photosFrom(data, safe), excerpt: data.content.slice(0, 720), extractedAt: new Date().toISOString() };
  }
}

export async function research({ input, sources, client, signal, onProgress = () => {} }) {
  const selected = PLATFORMS.filter((item) => sources.includes(item.id));
  if (!selected.length) throw new ResearchError('Choose at least one source to search.');
  signal?.throwIfAborted();
  let seed;
  if (input.sourceUrl && !input.clues) {
    onProgress({ stage: 'identify', message: 'Looking for this exact listing in the search index…' });
    const results = await client.search(`"${input.sourceUrl}"`, signal);
    seed = results.find((item) => canonicalUrl(item.url) === canonicalUrl(input.sourceUrl));
  }
  const reference = makeReference(input, seed);
  const candidates = [];
  const coverage = selected.map((source) => ({ id: source.id, name: source.name, state: 'pending', count: 0 }));
  let cursor = 0;
  let fatal;
  const worker = async () => {
    while (cursor < selected.length && !fatal) {
      signal?.throwIfAborted();
      const index = cursor++;
      const source = selected[index];
      coverage[index].state = 'running';
      onProgress({ stage: 'search', reference, coverage: structuredClone(coverage), message: `Searching ${source.name}…` });
      try {
        const rows = await client.search(buildQuery(reference, source), signal);
        signal?.throwIfAborted();
        const found = rows.map((row) => toCandidate(row, reference, source.id))
          .filter((item) => item && (!source.domain || item.platform === source.id));
        candidates.push(...found);
        Object.assign(coverage[index], { state: 'complete', count: found.length });
      } catch (error) {
        if (signal?.aborted || error.name === 'AbortError') throw error;
        Object.assign(coverage[index], { state: 'failed', error: error.message });
        if ([401, 402, 429].includes(error.status)) fatal = error;
      }
      onProgress({ stage: 'search', reference, coverage: structuredClone(coverage), message: `Checked ${coverage.filter((item) => ['complete', 'failed'].includes(item.state)).length} of ${selected.length} sources` });
    }
  };
  await Promise.all([worker(), worker()]);
  signal?.throwIfAborted();
  for (const source of coverage) {
    if (source.state === 'pending') Object.assign(source, { state: 'skipped', error: fatal?.message || 'Not searched.' });
  }
  const completed = coverage.filter((item) => item.state === 'complete').length;
  return {
    mode: 'live', reference, coverage, candidates: mergeCandidates(candidates),
    error: completed === 0 ? fatal?.message || 'All source searches failed. This is not a “no matches” result.' : null,
    partial: completed !== selected.length,
    observedAt: new Date().toISOString(),
  };
}
