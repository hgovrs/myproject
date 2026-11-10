import { PLATFORMS, canonicalUrl, csvFor, hostOf, parseInput, readingAllowed } from './lib.mjs';
import { JinaClient, research } from './provider.mjs';
import { EXAMPLES } from './examples.mjs';

const $ = (selector, root = document) => root.querySelector(selector);
const make = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const selectionKey = 'property-scout:selected-links:v1';
let apiKey = '';
let current = null;
let searchController = null;
let generation = 0;
let pendingRead = null;
const reading = new Map();
const selected = new Set();
const dateLabel = (value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function notify(message, type = 'warning') {
  const box = $('#notice');
  box.textContent = message;
  box.className = `notice notice-${type}`;
  box.hidden = !message;
}

function loadSelections() {
  try {
    const saved = localStorage.getItem(selectionKey);
    if (!saved) return;
    const urls = JSON.parse(saved);
    if (!Array.isArray(urls) || urls.some((url) => typeof url !== 'string')) throw new Error('Invalid stored selections.');
    for (const url of urls.slice(0, 500)) {
      const safe = canonicalUrl(url);
      if (safe) selected.add(safe);
    }
  } catch {
    notify('Saved selections could not be read. You can still shortlist links in this tab; use “Clear saved selections” to remove an invalid record.');
  }
}

function saveSelections() {
  try {
    localStorage.setItem(selectionKey, JSON.stringify([...selected]));
  } catch {
    notify('This browser blocked saving selections. They remain available in this tab only.');
  }
}

function updateConnection() {
  $('#connection-label').textContent = apiKey ? 'Key connected' : 'Connect live search';
  $('#connection-dot').classList.toggle('connected', Boolean(apiKey));
  $('#disconnect-button').hidden = !apiKey;
  $('#search-help').textContent = apiKey
    ? 'Your key is connected for this tab. Each search can make up to eight provider requests; credits may apply.'
    : 'Live search needs your own Jina API key. It stays in this tab, never in the published site.';
}

function cancelRequests() {
  generation++;
  searchController?.abort();
  searchController = null;
  for (const controller of reading.values()) controller.abort();
  reading.clear();
  pendingRead = null;
  $('#reading-dialog').close();
  setBusy(false);
}

function setBusy(busy) {
  $('#results-panel').setAttribute('aria-busy', String(busy));
  $('#search-button').disabled = busy;
  $('#cancel-button').hidden = !busy;
  $('#progress').hidden = !busy;
}

function renderCoverage(coverage = []) {
  const container = $('#coverage');
  container.replaceChildren();
  container.hidden = !coverage.length;
  for (const source of coverage) {
    const state = {
      pending: 'waiting', running: 'searching', complete: `${source.count} candidates`,
      failed: 'failed', skipped: 'not searched', sample: 'saved observation',
    }[source.state];
    const chip = make('span', `${source.name} · ${state}`, `coverage-chip ${source.state}`);
    if (source.error) {
      chip.title = source.error;
      chip.setAttribute('aria-label', `${chip.textContent}. ${source.error}`);
    }
    container.append(chip);
  }
}

function renderContext() {
  const box = $('#research-context');
  box.replaceChildren();
  box.hidden = !current;
  if (!current) return;
  box.append(make('strong', current.reference.title));
  if (current.reference.sourceUrl) {
    const link = make('a', `Starting listing · ${hostOf(current.reference.sourceUrl)} ↗`);
    Object.assign(link, { href: current.reference.sourceUrl, target: '_blank', rel: 'noopener noreferrer' });
    box.append(link);
  }
  box.append(make('p', current.mode === 'sample'
    ? `Saved research from ${dateLabel(current.observedAt)}. Not a live search. Photos were not collected in the initial test; optional page reading is separate.`
    : 'Candidates from the search index, not verified property identities. Site scope and failures are shown below; no complete-web coverage is implied.'));
  $('#mode-badge').textContent = current.mode === 'sample' ? 'Saved example · not live' : 'Live search';
  $('#mode-badge').classList.toggle('live', current.mode === 'live');
}

function updateToolbar() {
  const list = current?.candidates || [];
  const count = list.filter((item) => selected.has(canonicalUrl(item.url))).length;
  $('#selected-count').textContent = count;
  $('#export-button').disabled = count === 0;
  $('#results-toolbar').hidden = list.length === 0;
  $('#selection-note').hidden = list.length === 0 && selected.size === 0;
}

function showEmpty(title, description) {
  const box = $('#empty-state');
  box.hidden = false;
  $('h3', box).textContent = title;
  $('p', box).textContent = description;
  $('.empty-steps', box).hidden = Boolean(current);
}

function addDetail(list, label, value) {
  list.append(make('dt', label), make('dd', value || 'Not established'));
}

function renderCard(item) {
  const card = $('#result-template').content.firstElementChild.cloneNode(true);
  card.dataset.url = item.url;
  const isSelected = selected.has(canonicalUrl(item.url));
  card.classList.toggle('is-selected', isSelected);
  $('.site-badge', card).textContent = item.siteType;
  $('.card-title', card).textContent = item.title;
  $('.card-location', card).textContent = item.location || `Location not confirmed · ${hostOf(item.url)}`;
  const pick = $('.pick-checkbox', card);
  pick.checked = isSelected;
  pick.setAttribute('aria-label', `Shortlist ${item.title}`);
  pick.addEventListener('change', () => {
    const key = canonicalUrl(item.url);
    if (pick.checked && selected.size >= 500) {
      pick.checked = false;
      notify('The saved shortlist is limited to 500 links. Clear some selections before adding more.');
      return;
    }
    if (pick.checked) selected.add(key);
    else selected.delete(key);
    saveSelections();
    card.classList.toggle('is-selected', pick.checked);
    updateToolbar();
    if ($('#only-selected').checked) renderResults();
  });
  const facts = $('.card-facts', card);
  if (item.facts.bedrooms !== null) facts.append(make('span', `${item.facts.bedrooms} bedrooms reported`));
  if (item.facts.guests !== null) facts.append(make('span', `${item.facts.guests} guests reported`));
  if (item.facts.bathrooms !== null) facts.append(make('span', `${item.facts.bathrooms} bathrooms reported`));
  $('.card-excerpt', card).textContent = item.excerpt || 'No useful description was returned. Open the source to inspect this candidate.';
  $('.evidence-list', card).append(...item.evidence.map((text) => make('li', text)));
  if (item.conflicts.length) {
    $('.conflict-block', card).hidden = false;
    $('.conflict-block', card).textContent = `Check carefully: ${item.conflicts.join(' ')}`;
  }
  const details = $('.details-list', card);
  addDetail(details, 'Source website', hostOf(item.url));
  addDetail(details, 'Site classification', item.siteType);
  addDetail(details, 'Reported identifiers', item.facts.registrations.join(', ') || 'Not found in available text; registration status unknown');
  addDetail(details, 'Features mentioned', item.facts.features.join(', ') || 'No features extracted');
  addDetail(details, 'Evidence method', item.extraction);
  addDetail(details, 'Review priority', item.priority);
  addDetail(details, 'Ownership', 'Not verified; contact may be a manager or intermediary');
  addDetail(details, 'Availability / price', 'Not verified');
  addDetail(details, 'Observed', dateLabel(item.observedAt));
  const open = $('.open-property', card);
  open.href = item.url;
  open.setAttribute('aria-label', `Open ${item.title} on ${hostOf(item.url)} in a new tab`);
  const read = $('.read-property', card);
  read.disabled = !readingAllowed(item.url) || reading.has(item.id);
  read.textContent = !readingAllowed(item.url) ? 'Page reading unavailable' : reading.has(item.id) ? 'Reading public page…' : item.extractedAt ? 'Refresh details & photos' : 'Read details & photos';
  read.addEventListener('click', () => {
    pendingRead = item.id;
    $('#reading-target').textContent = `${item.title} · ${hostOf(item.url)}`;
    $('#reading-permission').checked = false;
    $('#confirm-reading').disabled = true;
    $('#reading-dialog').showModal();
  });
  if (item.photos.length) {
    $('.photo-placeholder', card).hidden = true;
    const gallery = $('.photo-gallery', card);
    gallery.hidden = false;
    $('.photo-caption', card).hidden = false;
    for (const photo of item.photos.slice(0, 3)) {
      const link = make('a');
      Object.assign(link, { href: photo.url, target: '_blank', rel: 'noopener noreferrer' });
      link.setAttribute('aria-label', 'Open source image in a new tab');
      const image = make('img');
      Object.assign(image, { src: photo.url, alt: photo.alt, loading: 'lazy', referrerPolicy: 'no-referrer' });
      image.addEventListener('error', () => link.replaceChildren(make('span', 'Source image unavailable', 'unavailable-image')), { once: true });
      link.append(image);
      gallery.append(link);
    }
  }
  if (item.readMessage) {
    const message = $('.card-error', card);
    message.textContent = item.readMessage;
    message.hidden = false;
  }
  $('.card-provenance', card).textContent = `${item.mode === 'sample' ? 'SAVED RESEARCH' : 'LIVE INDEX SEARCH'} · ${dateLabel(item.observedAt)}${item.extractedAt ? ` · Public page read ${dateLabel(item.extractedAt)}` : ''}`;
  return card;
}

function renderResults() {
  const all = current?.candidates || [];
  $('#result-count').textContent = all.length;
  const filter = $('#result-filter').value;
  const onlySelected = $('#only-selected').checked;
  const visible = all.filter((item) =>
    (filter === 'all' || (filter === 'web' ? item.platform === 'web' : item.platform !== 'web')) &&
    (!onlySelected || selected.has(canonicalUrl(item.url))),
  );
  $('#results-list').replaceChildren(...visible.map(renderCard));
  $('#empty-state').hidden = visible.length > 0 || Boolean(searchController);
  if (!visible.length && !searchController && current) {
    if (current.error) showEmpty('The search could not finish.', current.error);
    else if (all.length) showEmpty('Nothing in this view yet.', 'Change the website filter or uncheck “Shortlisted” to see more candidates.');
    else showEmpty('No candidates returned.', 'Try a more specific name, location or registration. No result is not proof that the property has no other website.');
  }
  updateToolbar();
}

function renderResearch() {
  renderContext();
  renderCoverage(current?.coverage);
  const warning = $('#result-warning');
  warning.hidden = true;
  if (current?.error || current?.partial) {
    warning.hidden = false;
    const failures = (current.coverage || []).filter((item) => item.error).map((item) => `${item.name}: ${item.error}`).join(' ');
    warning.textContent = `${current.error || 'Partial search: some sources were not completed.'} ${failures}`.trim();
  }
  renderResults();
}

function loadExample(name) {
  cancelRequests();
  notify('');
  current = structuredClone(EXAMPLES[name]);
  $('#property-input').value = current.reference.sourceUrl;
  $('#extra-clues').value = '';
  $('#country').value = current.reference.country;
  $('#only-selected').checked = false;
  $('#result-filter').value = 'all';
  renderResearch();
}

for (const source of PLATFORMS) {
  const label = make('label', undefined, 'source-choice');
  const checkbox = make('input');
  Object.assign(checkbox, { type: 'checkbox', value: source.id, checked: true, name: 'sources' });
  label.append(checkbox, make('span', source.name));
  $('#source-options').append(label);
}

$('#search-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  let input;
  try {
    input = parseInput($('#property-input').value, $('#extra-clues').value, $('#country').value);
  } catch (error) {
    notify(error.message, 'error');
    return;
  }
  const sources = [...document.querySelectorAll('input[name="sources"]:checked')].map((item) => item.value);
  if (!sources.length) {
    notify('Choose at least one source to search.', 'error');
    return;
  }
  if (!apiKey) {
    notify('This is a live-search request. Connect your own Jina key, then press “Find possible matches” again. No sample results will be substituted.');
    $('#connection-dialog').showModal();
    return;
  }
  cancelRequests();
  const run = generation;
  const controller = new AbortController();
  searchController = controller;
  current = {
    mode: 'live', reference: { title: input.text || input.sourceUrl, sourceUrl: input.sourceUrl },
    candidates: [], coverage: [], observedAt: new Date().toISOString(),
  };
  notify('');
  $('#result-filter').value = 'all';
  $('#only-selected').checked = false;
  renderResearch();
  setBusy(true);
  $('#progress-message').textContent = 'Preparing your search…';
  try {
    const result = await research({
      input, sources, client: new JinaClient(apiKey), signal: controller.signal,
      onProgress: (progress) => {
        if (run !== generation) return;
        $('#progress-message').textContent = progress.message;
        if (progress.reference) {
          current.reference = progress.reference;
          renderContext();
        }
        if (progress.coverage) {
          current.coverage = progress.coverage;
          renderCoverage(progress.coverage);
        }
      },
    });
    if (run !== generation) return;
    current = result;
  } catch (error) {
    if (run !== generation) return;
    current.error = error.name === 'AbortError' ? 'Research was cancelled. No complete search result is available.' : error.message;
    current.coverage = current.coverage.map((item) => ['pending', 'running'].includes(item.state) ? { ...item, state: 'skipped', error: current.error } : item);
  } finally {
    if (run === generation) {
      searchController = null;
      setBusy(false);
      renderResearch();
    }
  }
});

$('#cancel-button').addEventListener('click', () => searchController?.abort());
for (const button of document.querySelectorAll('[data-example]')) button.addEventListener('click', () => loadExample(button.dataset.example));
$('#connection-button').addEventListener('click', () => $('#connection-dialog').showModal());
for (const button of document.querySelectorAll('[data-close]')) button.addEventListener('click', () => document.getElementById(button.dataset.close).close());
$('#connection-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const key = $('#api-key').value.trim();
  if (key.length < 8 || /\s/.test(key)) {
    $('#api-key').setCustomValidity('Paste a valid API key without whitespace.');
    $('#api-key').reportValidity();
    return;
  }
  apiKey = key;
  $('#api-key').value = '';
  updateConnection();
  $('#connection-dialog').close();
  notify('Key connected for this tab. It has not been validated yet; the provider will check it on your next request.', 'success');
});
$('#api-key').addEventListener('input', () => $('#api-key').setCustomValidity(''));
$('#disconnect-button').addEventListener('click', () => {
  cancelRequests();
  apiKey = '';
  $('#api-key').value = '';
  updateConnection();
  $('#connection-dialog').close();
  if (current?.mode === 'live' && !current.candidates.length) {
    current.error = 'Disconnected before research completed.';
    current.coverage = current.coverage.map((item) => ['pending', 'running'].includes(item.state)
      ? { ...item, state: 'skipped', error: current.error } : item);
  }
  renderResearch();
  notify('Key forgotten and pending requests cancelled. Saved link selections are unchanged.');
});
$('#reading-permission').addEventListener('change', (event) => { $('#confirm-reading').disabled = !event.target.checked; });
$('#confirm-reading').addEventListener('click', async () => {
  if (!$('#reading-permission').checked) return;
  const item = current?.candidates.find((candidate) => candidate.id === pendingRead);
  if (!item || reading.has(item.id)) return;
  $('#reading-dialog').close();
  const controller = new AbortController();
  const run = generation;
  reading.set(item.id, controller);
  item.readMessage = '';
  renderResults();
  try {
    const details = await new JinaClient(apiKey).read(item.url, controller.signal);
    if (run !== generation) return;
    for (const field of ['bedrooms', 'guests', 'bathrooms']) {
      if (details.facts[field] !== null && item.facts[field] !== null && details.facts[field] !== item.facts[field]) {
        const conflict = `Public page reports ${details.facts[field]} ${field}; the indexed text reported ${item.facts[field]}.`;
        if (!item.conflicts.includes(conflict)) item.conflicts.push(conflict);
      }
    }
    item.facts = {
      bedrooms: details.facts.bedrooms ?? item.facts.bedrooms,
      guests: details.facts.guests ?? item.facts.guests,
      bathrooms: details.facts.bathrooms ?? item.facts.bathrooms,
      registrations: [...new Set([...item.facts.registrations, ...details.facts.registrations])],
      features: [...new Set([...item.facts.features, ...details.facts.features])],
    };
    item.photos = details.photos;
    item.extractedAt = details.extractedAt;
    item.extraction += '; optional public page read via Jina (facts can include other content on the page)';
    item.readMessage = details.photos.length ? '' : 'The public page was read, but no usable image links were returned. No substitute photos were added.';
  } catch (error) {
    if (run === generation) item.readMessage = error.name === 'AbortError' ? 'Page reading cancelled.' : error.message;
  } finally {
    if (reading.get(item.id) === controller) reading.delete(item.id);
    if (run === generation) renderResults();
  }
});
$('#result-filter').addEventListener('change', renderResults);
$('#only-selected').addEventListener('change', renderResults);
$('#clear-selection').addEventListener('click', () => {
  selected.clear();
  try {
    localStorage.removeItem(selectionKey);
    notify('Saved selections cleared.', 'success');
  } catch {
    notify('Selections were cleared from this tab, but the browser refused to remove the saved record. Clear site storage in your browser.');
  }
  renderResults();
});
$('#export-button').addEventListener('click', () => {
  const items = (current?.candidates || []).filter((item) => selected.has(canonicalUrl(item.url)));
  if (!items.length) return;
  const url = URL.createObjectURL(new Blob(['\uFEFF', csvFor(items)], { type: 'text/csv;charset=utf-8' }));
  const link = make('a');
  Object.assign(link, { href: url, download: `property-shortlist-${current.mode}-${new Date().toISOString().slice(0, 10)}.csv` });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

loadSelections();
updateConnection();
updateToolbar();
