export const PLATFORMS = [
  { id: 'airbnb', name: 'Airbnb', domain: 'airbnb.com' },
  { id: 'plum', name: 'Plum Guide', domain: 'plumguide.com' },
  { id: 'thinking', name: 'The Thinking Traveller', domain: 'thethinkingtraveller.com' },
  { id: 'blackbook', name: 'Black Book Villas', domain: 'blackbookvillas.com' },
  { id: 'worldwide', name: 'Worldwide Dream Villas', domain: 'worldwidedreamvillas.com' },
  { id: 'villanovo', name: 'Villanovo', domain: 'villanovo.com' },
  { id: 'web', name: 'Wider internet', domain: null },
];

export function publicUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    if (url.port && !['80', '443'].includes(url.port)) return null;
    if (!host.includes('.') || host.includes(':') || /^[\d.]+$/.test(host)) return null;
    if (/\.(?:localhost|local|internal|test|invalid|onion)$/.test(host)) return null;
    if (/(?:^|\.)(?:localhost|metadata\.google\.internal)$/.test(host)) return null;
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

export function canonicalUrl(value) {
  const safe = publicUrl(value);
  if (!safe) return null;
  const url = new URL(safe);
  url.protocol = 'https:';
  url.port = '';
  url.hostname = url.hostname.replace(/^www\./, '');
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_.+|fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.href;
}

export function hostOf(value) {
  const safe = publicUrl(value);
  return safe ? new URL(safe).hostname.replace(/^www\./, '') : '';
}

export function platformFor(value) {
  const host = hostOf(value);
  return PLATFORMS.find(({ domain }) => domain && (host === domain || host.endsWith(`.${domain}`))) ||
    PLATFORMS.find(({ id }) => id === 'web');
}

export function readingAllowed(value) {
  const host = hostOf(value);
  return Boolean(host) && !/(^|\.)airbnb\.[a-z.]+$/.test(host);
}

export function normalizeText(value = '') {
  return String(value).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}/]+/gu, ' ').trim();
}

const STOP_WORDS = new Set(
  'a an and the or of on in at to for with from this that has is are villa villas property properties rental rentals luxury holiday home house booking bedrooms guests entire portugal spain europe www com https http'.split(' '),
);

export function termsFor(value) {
  return [...new Set(normalizeText(value).split(/\s+/).filter(
    (word) => word.length > 2 && !STOP_WORDS.has(word) && !/^\d+$/.test(word),
  ))].slice(0, 24);
}

export function extractFacts(value = '') {
  const text = String(value);
  const number = (pattern) => {
    const match = text.match(pattern);
    return match ? Number(match[1]) : null;
  };
  const registrations = [...new Set(
    (text.match(/\b\d{3,8}\s*\/\s*AL\b|\bETV[-/\s]*\d{2,8}\b|\bVT[-/]\d{3,8}(?:-[ABVE])?\b/gi) || [])
      .map((item) => item.replace(/\s+/g, '').toUpperCase()),
  )].slice(0, 4);
  const features = [
    ['Pool', /\b(?:pool|piscina|piscine)\b/i],
    ['Sea views', /\b(?:sea views?|ocean views?|vista[s]? (?:al|para o) mar)\b/i],
    ['Beach', /\b(?:beach|praia|playa)\b/i],
    ['Terrace', /\b(?:terrace|terraco|terraço|terraza)\b/i],
    ['Garden', /\b(?:garden|jardim|jardin)\b/i],
    ['Parking', /\b(?:parking|estacionamento|aparcamiento)\b/i],
  ].filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
  return {
    bedrooms: number(/\b(\d{1,2})\s*(?:[- ]bedroom|bedrooms?|quartos?|habitaciones?|chambres?)\b/i),
    guests: number(/\b(\d{1,3})\s*(?:guests?|hóspedes|hospedes|personas|people|personnes)\b/i) ??
      number(/\bsleeps\s+(\d{1,3})\b/i),
    bathrooms: number(/\b(\d{1,2}(?:\.\d)?)\s*(?:bathrooms?|baths?|banheiros?|baños)\b/i),
    registrations,
    features,
  };
}

export function parseInput(input, clues = '', country = '') {
  const text = String(input).trim();
  const extra = String(clues).trim();
  if (!text) throw new Error('Paste a listing link or describe a property first.');
  if (text.length > 1600 || extra.length > 600) throw new Error('Please shorten the property details.');
  const looksLikeUrl = /^[a-z][a-z\d+.-]*:|^www\./i.test(text);
  const sourceUrl = looksLikeUrl ? publicUrl(text.startsWith('www.') ? `https://${text}` : text) : null;
  if (looksLikeUrl && !sourceUrl) throw new Error('Use a public http:// or https:// property link, without passwords or a private address.');
  if (!sourceUrl && text.length < 4) throw new Error('Add a property name, town, registration number or a few descriptive details.');
  return { sourceUrl, text: sourceUrl ? '' : text, clues: extra, country: ['Spain', 'Portugal'].includes(country) ? country : '' };
}

export function cleanTitle(value) {
  return String(value || '').split(/\s+\|\s+|\s+-\s+/)[0].trim().slice(0, 180);
}

export function makeReference(input, seed) {
  const seedText = seed ? `${cleanTitle(seed.title)} ${seed.description || ''}` : '';
  if (input.sourceUrl && !seed && !input.clues) {
    throw new Error('The search index did not identify this exact listing. Add its name, town or description in “Extra clues” and try again.');
  }
  const identity = [input.text, input.clues, seed ? cleanTitle(seed.title) : ''].filter(Boolean).join(' ');
  const raw = [identity, seedText, input.country].filter(Boolean).join(' ');
  const facts = extractFacts(raw);
  const query = [identity.slice(0, 350), facts.registrations[0], input.country].filter(Boolean).join(' ');
  return {
    title: input.text ? input.text.slice(0, 100) : cleanTitle(seed?.title) || input.clues.slice(0, 100),
    sourceUrl: input.sourceUrl,
    query,
    country: input.country,
    terms: termsFor(raw),
    registrations: facts.registrations,
  };
}

export function buildQuery(reference, platform) {
  return platform.domain ? `${reference.query} site:${platform.domain}` : reference.query;
}

export function toCandidate(entry, reference, sourceId) {
  const url = canonicalUrl(entry?.url);
  if (!url || url === canonicalUrl(reference.sourceUrl)) return null;
  const title = String(entry.title || hostOf(url)).slice(0, 240);
  const excerpt = String(entry.description || entry.content || '').slice(0, 720);
  const corpus = normalizeText(`${title} ${excerpt}`);
  const matchedTerms = reference.terms.filter((term) => corpus.includes(term));
  const facts = extractFacts(`${title} ${excerpt}`);
  const matchedRegistrations = facts.registrations.filter((item) => reference.registrations.includes(item));
  const evidence = [];
  if (matchedRegistrations.length) evidence.push(`Same reported identifier: ${matchedRegistrations.join(', ')} (not registry-verified)`);
  if (matchedTerms.length) evidence.push(`Text overlaps: ${matchedTerms.slice(0, 6).join(', ')}`);
  if (!evidence.length) evidence.push('Returned by the search engine; no shared text clue established yet.');
  const conflicts = [];
  if (reference.country === 'Portugal' && /\b(?:anguilla|barbados|jamaica)\b/.test(corpus)) conflicts.push('The indexed location appears outside Portugal.');
  if (reference.country === 'Spain' && /\b(?:anguilla|barbados|jamaica|algarve)\b/.test(corpus)) conflicts.push('The indexed location appears outside Spain.');
  const platform = platformFor(url);
  return {
    id: url, url, title, excerpt, facts, evidence, conflicts, photos: [],
    location: '', platform: platform.id, siteType: platform.id === 'web' ? 'Unclassified website' : 'Listing platform',
    priority: matchedRegistrations.length || matchedTerms.length >= 2 ? 'Review first' : 'Needs checking',
    rank: matchedRegistrations.length * 10 + matchedTerms.length - conflicts.length * 20,
    foundIn: [sourceId],
    mode: 'live', observedAt: new Date().toISOString(), extraction: 'Search-index text',
  };
}

export function mergeCandidates(candidates) {
  const unique = new Map();
  for (const candidate of candidates) {
    if (!candidate) continue;
    const key = canonicalUrl(candidate.url);
    if (!key) continue;
    const previous = unique.get(key);
    if (previous) {
      previous.foundIn = [...new Set([...previous.foundIn, ...candidate.foundIn])];
    } else {
      unique.set(key, { ...candidate, foundIn: [...candidate.foundIn] });
    }
  }
  return [...unique.values()].sort((a, b) => b.rank - a.rank);
}

export function photosFrom(page, sourceUrl) {
  const pairs = [];
  if (Array.isArray(page.images)) {
    for (const item of page.images) pairs.push(typeof item === 'string' ? ['', item] : [item?.alt || item?.description || '', item?.url || item?.src]);
  } else if (page.images && typeof page.images === 'object') {
    for (const [key, value] of Object.entries(page.images)) {
      pairs.push(publicUrl(key) ? [typeof value === 'string' ? value : '', key] : [key, value]);
    }
  }
  for (const match of String(page.content || '').matchAll(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)(?:\s+"[^"]*")?\)/g)) pairs.push([match[1], match[2]]);
  const seen = new Set();
  return pairs.flatMap(([alt, value]) => {
    const url = typeof value === 'string' ? publicUrl(value) : null;
    if (!url || !url.startsWith('https:') || seen.has(url) || /(?:logo|favicon|sprite|avatar|tracking|pixel|\.svg(?:\?|$))/i.test(`${alt} ${url}`)) return [];
    seen.add(url);
    return [{ url, alt: String(alt || 'Image from the linked page').slice(0, 180), sourceUrl }];
  }).slice(0, 6);
}

export function csvFor(candidates) {
  const cell = (value) => {
    let text = String(value ?? '');
    if (/^\s*[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const rows = [
    ['Property', 'URL', 'Site type', 'Location', 'Reported bedrooms', 'Reported guests', 'Reported identifiers', 'Evidence', 'Conflicts', 'Data mode', 'Observed at'],
    ...candidates.map((item) => [
      item.title, item.url, item.siteType, item.location, item.facts.bedrooms, item.facts.guests,
      item.facts.registrations.join('; '), item.evidence.join('; '), item.conflicts.join('; '), item.mode, item.observedAt,
    ]),
  ];
  return rows.map((row) => row.map(cell).join(',')).join('\r\n');
}
