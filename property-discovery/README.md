# Property Scout client preview

Static, dependency-free runtime hosted at
<https://hgovrs.github.io/myproject/property-discovery/>.
It lives beside the existing website; publishing it must not replace the site's
root files or change the Pages source branch.

## What works

- Enter a public property URL or descriptive text, with optional clues and country.
- Search each selected platform and/or the wider web through Jina Search.
- Deduplicate actual result URLs and explain text overlaps, without claiming
  calibrated match probabilities, direct-site status, or owner identity.
- Review reported facts, open source links, shortlist candidates, filter results,
  and export the current shortlist to CSV.
- Optionally read a permitted public page through Jina Reader for additional
  reported facts and image URLs. Images are linked to their source, not generated
  or rehosted. Unavailable images are labelled rather than replaced with stock.
- Explore two explicitly labelled saved examples from the 2026-11-09 research.

## Live search requires a visitor-supplied key

GitHub Pages cannot keep a shared API secret. This pilot uses a **bring-your-own-key**
connection, not an anonymous hosted search backend.

1. Obtain a limited test API key from <https://jina.ai/reader/>.
2. Click **Connect live search** and enter the key.
3. Enter a URL or property details and start a search.

The key is held only in JavaScript memory and sent only to `s.jina.ai` and
`r.jina.ai` in an authorization header. It is not put in a URL, repository,
browser storage, logs, or analytics. Reloading disconnects it.
Do not distribute an owner/admin key to clients.

Provider credits may be charged. A run uses up to one lookup to identify an
input URL and one search for each of the seven source choices, with two searches
in flight at a time. Optional page reads are separate calls. Authentication,
credit, rate-limit, network, blocked-page, and partial-search failures are explicit.
No live-search error is replaced with sample results.

The public share link can demonstrate the UI without a key, but it does **not**
provide anonymous live searches. A shared client-ready service needs a separately
deployed backend, a funded provider account, authorization, quotas, and cost
controls. No such backend or provider subscription is provisioned here.

## Evidence and privacy boundaries

- Searches use `X-Respond-With: no-content`: indexed titles and descriptions,
  without automatically reading every returned page.
- Optional Reader requests use `X-Robots-Txt: *`. The user must confirm permission
  before each page read. This respects a technical restriction, not a substitute
  for contractual permission. Airbnb page reading is disabled.
- Facts are extracted with simple text rules; there is no LLM-based identity
  verification or reverse image search in this preview.
- Site classification is known for the six platforms. Other live result sites
  remain **unclassified**, even if they look like a direct property website.
- Photos come from the selected page, may be unrelated to the property, and must
  be reviewed. The saved research did not collect photos; sample cards initially
  show an explicit no-photo placeholder.
- Shortlisted links are saved only in the current browser's local storage.
  Search results, descriptions, queries, and credentials are not persisted.
  Export is an explicit user action; provider/source retention rights still apply.
- Browser requests share queries, requested URLs, and network information with
  Jina; loading photos also contacts the image host. Use public business/property
  information only.
- An unverified or missing identifier is not evidence that a property is
  unregistered. A match is not proof of ownership or permission to send marketing.

API contracts were checked against the public Jina Reader source:

- <https://github.com/jina-ai/reader/blob/main/src/api/searcher.ts>
- <https://github.com/jina-ai/reader/blob/main/src/dto/crawler-options.ts>
- <https://github.com/jina-ai/reader>

The initial research document is in
[PR #3](https://github.com/hgovrs/myproject/pull/3).

## Local checks

```sh
cd property-discovery
npm test
npm ci
npx playwright install chromium
npm run test:browser
```

Unit tests use Node's built-in runner. Browser tests use Playwright with provider
responses intercepted locally, so they do not spend credits or prove live
provider availability. Live search must be separately exercised with a valid
account/key; none is included.

For manual local use, serve this directory using an HTTP server rather than
opening `index.html` as a `file://` URL (ES modules require HTTP).
