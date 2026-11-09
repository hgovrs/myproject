# Property Outreach Discovery Assistant

**Status:** Discovery proposal; no application has been implemented.
**Research date:** 2026-11-09.
**Initial market:** Spain and Portugal, with possible expansion across Europe.

## 1. Idea and intended outcome

A user submits a property listing URL. The tool identifies useful details, searches
for matching properties elsewhere online, and presents candidate matches in a
table for human review. The user can then investigate the property's own website
or a public business contact route.

The goal is to reduce manual research and support new business development, not
to automate unsolicited messages or guarantee the identity of a property owner.
A matching property, a direct commercial website, and legal ownership are three
different findings.

The client suggested Airbnb, Plum Guide, The Thinking Traveller, Black Book
Villas, Worldwide Dream Villas, and Villanovo as starting sources. These are
requested sources, not a confirmed list of supported integrations.

**Initial evidence is encouraging but limited:** indexed public content produced
two strong candidate matches, one in each initial country. Direct extraction,
reverse image search, ownership, and production accuracy remain unvalidated.

## 2. Scope and proposed delivery

The confirmed intent is URL-based discovery using names, registration numbers,
descriptions, and photos, followed by a human-reviewed results table.

The proposed implementation sequence is:

1. **Text-first pilot:** individual listing URLs, permitted sources, name and
   registration searches, description clues, evidence links, and review.
2. **Photo-assisted pilot:** evaluate reverse image search and measure whether it
   finds useful candidates that text search misses.
3. **Usable MVP:** combine validated capabilities with saved research, deduplication,
   review filters, and CSV export, subject to provider storage rights.

This sequence is a proposal, not an agreement to remove photos from the product.
Image support must not be advertised as working until evaluated.

Whole-site crawling, bulk imports, CRM integrations, native mobile applications,
automatic messaging, and legal ownership verification are outside the first pilot.
A catalogue URL would require a separately agreed page limit and permitted
navigation policy rather than an unrestricted crawl.

## 3. User workflow

1. Submit an individual property listing URL.
2. Check whether the source is supported and access is permitted.
3. Extract available property signals with their source and retrieval method.
4. Search for candidate pages, starting with specific identifiers and descriptions.
5. Compare available evidence and record both agreements and contradictions.
6. Display candidates with links, evidence, site classification, and review state.
7. Let the reviewer confirm, reject, or leave a candidate uncertain.
8. Let the user follow a public business contact route after their own assessment.

Finding no candidates must be distinguishable from a blocked source, failed
extraction, or failed search.

## 4. Functional requirements

| ID | Requirement |
|---|---|
| FR-01 | Accept a public HTTP(S) listing URL; reject unsupported or unsafe destinations explicitly. |
| FR-02 | Extract the displayed name, alternative names in the description, published locality, property registration identifiers, bedroom count, capacity, and distinctive features where available. |
| FR-03 | Preserve the raw registration value, identifier type, and jurisdiction. Do not confuse an agency's registration or another listing's identifier with the property being researched. |
| FR-04 | Search using registration variants, names plus location, and distinctive description phrases. Preserve useful original-language terms when handling translations. |
| FR-05 | Evaluate reverse image search using selected property photos that may lawfully be processed. Return source page URLs as evidence; similar-looking rooms alone do not establish a match. |
| FR-06 | Compare multiple signals, flag contradictory locations or identifiers, and show why a candidate was returned. Do not present an uncalibrated percentage as a probability of correctness. |
| FR-07 | Classify candidate sites separately from the property match: property-branded site, operator/manager, agency/portal, or unknown. Do not automatically label a contact as the owner. |
| FR-08 | Deduplicate repeated candidate URLs and group likely references to the same property without silently merging conflicting evidence. |
| FR-09 | Provide a review table with source property, candidate URL, site type, supporting/conflicting evidence, review priority, and review state. |
| FR-10 | Support reviewer decisions and notes. Persist and export only data that the source and API terms permit retaining. |
| FR-11 | Record source URLs, observation dates, and whether evidence came from a live page, structured data, a search index, or an image search service. |
| FR-12 | Report access, extraction, search, and processing failures explicitly. Missing or inaccessible information must not be replaced with invented data. |

Minimum review states are `unreviewed`, `match`, `non-match`, and `uncertain`.
These describe the reviewer's property comparison, not verified legal ownership.
Processing states and access errors must remain separate from review states.

A minimum evidence record should contain:

| Field | Purpose |
|---|---|
| Original and candidate URLs | Let the reviewer trace both sides of a comparison. |
| Raw and normalized signals | Support search without losing the source's actual wording or identifier. |
| Observation date and retrieval method | Distinguish current observation from indexed content of unknown freshness. |
| Supporting and conflicting evidence | Explain the match rather than hiding it behind a score. |
| Candidate site type | Distinguish a property-branded site from another intermediary. |
| Review decision and notes | Preserve human judgement and unresolved questions. |
| Public business contact page, if found | Provide a route for investigation without guessing personal contact details. |

## 5. Technical approach to evaluate

No custom model training is required for the proposed pilot.

- Use structured page data and HTML parsing first; use a browser such as
  Playwright only where needed and where access is permitted.
- Use an LLM to organize extracted content and identify clues, not to manufacture
  facts. Every returned identifier and actionable match needs a source.
- Evaluate a search API such as [Brave Search][brave], including whether the
  selected agreement permits saving and exporting results.
- Evaluate [Google Cloud Vision Web Detection][vision-web] and
  [TinEye][tineye] for photo-assisted discovery. Neither was exercised in the
  initial test.
- Use hashes or image embeddings only as additional comparisons over images
  already obtained. They do not independently search the public web.

A possible architecture is:

```text
Web interface -> job queue -> permitted extraction and search
              -> evidence comparison -> database -> human review table
```

Provider selection, hosting, prices, retention, and throughput are not committed.
Use bounded work per listing, timeouts, limited retries, explicit failures, and
licensed caching where available. Keep service credentials server-side.

## 6. Access, privacy, and safety requirements

- Public visibility does not automatically grant permission to automate access,
  reuse content, or send marketing. Review each platform's terms and robots
  policy; a permissive robots file is not a complete legal authorization.
- Airbnb's [terms][airbnb-terms] restrict automated access. Do not assume Airbnb
  scraping is an available integration without appropriate permission.
- Do not bypass login requirements, CAPTCHAs, or access controls. Unsupported
  sources should be reported as such, with an authorized input route considered
  separately rather than a circumvention mechanism.
- Fetch only permitted public web resources. URL validation must also account
  for redirects and private/internal destinations.
- Treat retrieved pages as untrusted content, not instructions to the AI or
  permission to execute actions.
- Minimize collection to property research and relevant public business routes.
  Do not infer private contact details or compile unrelated personal profiles.
- Where personal data is involved, assess the applicable lawful basis,
  transparency, retention, deletion, and objection requirements. Public data
  remains subject to data protection obligations.
- Outreach rules depend on country, recipient, and channel. Human review does
  not remove those obligations. The [European Commission guidance][eu-marketing]
  is a starting point for the compliance review, not blanket permission.
- Check image rights and provider terms before sending images to external
  services. Avoid storing full descriptions or image copies unnecessarily.
- Registration of a tourism activity does not prove title to the real estate.

No outreach was performed during this research.

## 7. Initial discovery test

### Method and limitations

The test on 2026-11-09 used public search-index content and manually compared
candidate signals. Source links below are the cited search-result URLs.

Attempts to fetch pages from all six platforms failed with DNS-resolution errors
in the execution environment. An alternative browser attempt on Black Book
Villas returned `ERR_BLOCKED_BY_CLIENT`; a command-line request also failed DNS
resolution. These failures do not establish that the platforms themselves block
all extraction.

Consequently, this was **not a successful live scraper test**. Indexed details
may be incomplete or stale. Live page content and availability were not
independently confirmed. Image URLs and reverse image search were not tested.
No official tourism register, legal ownership record, or authenticated page was
queried.

### Findings by platform

| Platform | Indexed example | Signals reported in indexed content | Limitation |
|---|---|---|---|
| Airbnb | [Villa Tojeira][airbnb-tojeira], Sao Joao das Lampas, Portugal | Six bedrooms, 14 guests, registration `125511/AL`. | Registration not validated against an official register; automated access not established. |
| Plum Guide | [Salema Shores Serenity][plum-salema], Portugal | Two bedrooms and four guests. | Registration not verified; direct extraction not validated. |
| The Thinking Traveller | [Don Arcangelo all'Olmo][thinking-don], Giarre, Sicily | 12 bedrooms and up to 24 guests. | Outside the initial countries. No Spain/Portugal property was verified in this search; this does not prove absence of coverage. |
| Black Book Villas | [Villa Alegria][blackbook-alegria], Salema, Portugal | Four bedrooms, eight guests, rooftop pool and sea views. | Registration not verified; candidate matching used indexed text. |
| Worldwide Dream Villas | [Main domain][worldwide] | No specific property listing was verified. An association with [Algarve Dream Villas][algarve-about] was found. | Inconclusive. A related brand was not treated as a verified listing on the main domain. |
| Villanovo | [Villa Salema Alegria][villanovo-alegria] and [Villa Doblo][villanovo-doblo] | Portuguese listing: four bedrooms, eight guests, rooftop pool. Spanish listing: eight bedrooms and the name Son Doblons in the description. | Strong textual clues, but no live extraction, image comparison, or ownership verification. |

An unverified registration field means **unknown**, not that a property is
unregistered or that its full live page omits the number.

### Case A: Villa Alegria, Salema, Portugal

The starting point was [Black Book Villas][blackbook-alegria]. Searches combining
the name and locality led to:

| Candidate | Matching signals | Interpretation |
|---|---|---|
| [Villa Salema Alegria on Villanovo][villanovo-alegria] | Name variant, Salema, four bedrooms, eight guests, rooftop pool and sea views. | Another listing for a strongly matching property candidate. |
| [Villa Alegria on Vila Vita Collection][vilavita-alegria] | Same locality, name, bedroom/capacity details, and distinctive pool setting. | Commercial operator page with a booking/contact route; not proof of legal ownership. |

This demonstrates a route from a listing intermediary to a property's commercial
operation without first relying on a licence or photo match.

A same-name [Villa Alegria in Anguilla][alegria-anguilla] was excluded because its
location conflicts with Salema. Name equality alone is insufficient.

### Case B: Villa Doblo / Son Doblons, Mallorca, Spain

The [Villanovo listing][villanovo-doblo] uses the title "Villa Doblo", but its
indexed description explicitly mentions "Son Doblons". The indexed property is
in Santa Margalida and has eight bedrooms.

Searching the alternative name led to [sondoblons.com][sondoblons]. Its
[property page][sondoblons-villa] describes eight suites, and the published
locality also matches. This is a strong candidate property-branded website, not
an ownership verification.

The useful signal was inside the description rather than the listing title.
This supports extracting alternative names and distinctive phrases, not only
running a search on the page heading.

### What the test establishes

The two cases support the value of text-led discovery and explainable candidate
matching. They do not establish production support for any platform, photo-match
quality, a success rate, legal access rights, or return on investment.

The examples were selected during research, not drawn from a representative
benchmark. They must not be reported as a "100% success rate".

## 8. Proposed pilot and acceptance criteria

Use 30-50 representative listings across Spain and Portugal and the sources
that can actually be accessed under acceptable terms. Include difficult names,
renamed properties, missing registrations, genuine no-match cases, and access
failures rather than selecting only successful examples.

Create a human-reviewed reference set where possible. Record unresolved truth
as unknown, not as a negative. Compare text-only discovery with text plus images
on the same evaluation cases to measure the added value of photo search.

Measure:

| Metric | Measurement |
|---|---|
| Access and extraction coverage | Usable inputs divided by attempted inputs, with failures broken down by platform and cause. |
| Match precision | Correct matches divided by reviewed candidates with a resolved decision; report uncertain and unreviewed counts separately. |
| Property-site discovery yield | Listings for which a property-branded commercial site is confirmed, divided by all attempted listings. Report operator/manager results separately. |
| Known-positive coverage | Known direct sites recovered in the manually established reference subset; do not claim recall over the entire web. |
| Review time | Human effort per input and useful result compared with the manual workflow. |
| Cost per useful result | Search, extraction, image, model, and infrastructure usage divided by confirmed useful results. |
| Image-search contribution | Additional correct candidates found beyond text-only discovery, with additional cost and review effort. |

Before calling the pilot usable:

- Every actionable candidate must have traceable evidence and a source link.
- Inaccessible sources, processing failures, and completed searches with no
  candidates must remain distinguishable.
- Contradictions and uncertain site classifications must be visible to reviewers.
- A property match must not be presented as an identified owner.
- Review decisions must persist correctly; exports must preserve provenance and
  obey storage rights.
- The client must agree on acceptable accuracy, coverage, review effort, and
  cost thresholds before scaling. No numerical target has yet been agreed.

## 9. Decisions still needed

- Whether operator/manager contacts are useful, or only property-branded sites
  associated with independent owners are relevant.
- Expected listing volume, users, and acceptable research cost.
- Which platforms permit the required access and retention in practice.
- Whether initial inputs are individual listings only or also catalogues.
- Whether saved results and CSV export are required in the first usable release.
- What image service adds sufficient value, with acceptable terms and coverage.
- Retention, privacy responsibilities, and country/channel rules for later manual
  outreach.

There is no implementation commitment, confirmed operating budget, or delivery
date in this document. The next technical validation is permitted live extraction
and a representative benchmark, not broader scraping based on two examples.

## References

The property links below support the recorded indexed observations; they were
not all successfully opened live. API and policy links are evaluation references,
not evidence that integrations or commercial terms have been validated.

[airbnb-tojeira]: https://www.airbnb.com/rooms/620107227408448581
[plum-salema]: https://www.plumguide.com/homes/1197415/salema-shores-serenity
[thinking-don]: https://www.thethinkingtraveller.com/italy/sicily/villas/don-arcangelo-all-olmo
[blackbook-alegria]: https://www.blackbookvillas.com/luxury-rental-sun-portugal-algarve-salema-villa-alegria.html
[worldwide]: https://www.worldwidedreamvillas.com/
[algarve-about]: https://www.algarvedreamvillas.com/about-algarve-dream-villas
[villanovo-alegria]: https://www.villanovo.com/villa-rentals/europe/portugal/algarve/salema/villa-salema-alegria
[villanovo-doblo]: https://www.villanovo.com/villa-rentals/europe/spain/mallorca/north-mallorca/villa-doblo
[vilavita-alegria]: https://vilavitacollection.com/en/villas/villa-alegria
[sondoblons]: https://sondoblons.com/
[sondoblons-villa]: https://sondoblons.com/our-villa/
[alegria-anguilla]: https://alegriaanguilla.com/
[brave]: https://brave.com/search/api/
[vision-web]: https://cloud.google.com/vision/docs/detecting-web
[tineye]: https://services.tineye.com/TinEyeAPI
[airbnb-terms]: https://www.airbnb.com/help/article/2908
[eu-marketing]: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data/can-data-received-third-party-be-used-marketing_en
