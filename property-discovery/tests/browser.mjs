import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, resolve, sep } from 'node:path';
import { chromium, expect } from '@playwright/test';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html', '.css': 'text/css', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const relative = pathname.replace(/^\/property-discovery\//, '') || 'index.html';
  const path = resolve(root, relative);
  if (!path.startsWith(`${resolve(root)}${sep}`) || relative.includes('node_modules')) {
    response.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
    response.end(body);
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(error);
    response.writeHead(404).end();
  }
});
await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
let browser;
let debugPage;
const consoleErrors = [];
try {
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  debugPage = page;
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const origin = `http://127.0.0.1:${server.address().port}`;
  await page.goto(`${origin}/property-discovery/`, { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toContainText('behind the');
  await expect(page.locator('#mode-badge')).toHaveText('Ready to explore');
  await expect(page.locator('input[name=sources]:checked')).toHaveCount(7);
  await expect(page.locator('#country option')).toHaveCount(3);

  await page.locator('[data-example=portugal]').click();
  await expect(page.locator('#country')).toHaveValue('Portugal');
  await expect(page.locator('.result-card')).toHaveCount(2);
  await expect(page.locator('#mode-badge')).toContainText('not live');
  await expect(page.locator('.photo-gallery')).toHaveCount(2);
  assert.equal(await page.locator('.photo-gallery:not([hidden])').count(), 0);
  await expect(page.locator('.card-title').first()).toHaveText('Villa Alegria');
  await expect(page.locator('.open-property').first()).toHaveAttribute('href', 'https://vilavitacollection.com/en/villas/villa-alegria');
  await page.locator('.pick-checkbox').first().check();
  await expect(page.locator('#selected-count')).toHaveText('1');
  await page.locator('#only-selected').check();
  await expect(page.locator('.result-card')).toHaveCount(1);
  await page.locator('#only-selected').uncheck();
  await page.selectOption('#result-filter', 'platforms');
  await expect(page.locator('.result-card')).toHaveCount(1);
  await expect(page.locator('.card-title')).toContainText('Salema');
  await page.selectOption('#result-filter', 'all');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export-button').click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /shortlist-sample/);
  const csv = await readFile(await download.path(), 'utf8');
  assert.ok(csv.includes('"sample"') && csv.includes('vilavitacollection.com'));

  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-example=portugal]').click();
  await expect(page.locator('.pick-checkbox').first()).toBeChecked();
  await page.locator('#search-button').click();
  await expect(page.locator('#connection-dialog')).toBeVisible();
  await expect(page.locator('#notice')).toContainText('No sample results will be substituted');
  await page.locator('#api-key').fill('browser-test-key-not-a-secret');
  await page.locator('#connection-form button').click();
  await expect(page.locator('#connection-label')).toHaveText('Key connected');
  assert.equal(await page.locator('#api-key').inputValue(), '');
  const storage = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  assert.ok(!storage.includes('browser-test-key'));

  const requests = [];
  await page.route('https://s.jina.ai/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    requests.push(url.searchParams.get('q'));
    assert.equal(request.headers().authorization, 'Bearer browser-test-key-not-a-secret');
    assert.equal(request.headers()['x-respond-with'], 'no-content');
    assert.ok(!request.url().includes('browser-test-key'));
    const query = url.searchParams.get('q');
    if (query.includes('site:airbnb.com')) {
      await route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ code: 403 }) });
      return;
    }
    const data = [
      { url: 'https://villanovo.com/villa-one', title: 'Villa Alegria Salema', description: 'Salema villa, 4 bedrooms and 8 guests with a pool.' },
      { url: 'https://example.com/villa-one', title: '<img src=x onerror=alert(1)> Alegria Salema', description: '4 bedrooms and a terrace.' },
      { url: 'javascript:alert(1)', title: 'Unsafe result', description: 'Salema' },
    ];
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ code: 200, data }) });
  });
  await page.locator('#property-input').fill('Villa Alegria Salema');
  await page.locator('#search-button').click();
  await expect(page.locator('#progress')).toBeHidden({ timeout: 15000 });
  await expect(page.locator('#mode-badge')).toHaveText('Live search');
  await expect(page.locator('.result-card')).toHaveCount(2);
  assert.equal(requests.length, 7);
  await expect(page.locator('#result-warning')).toContainText('Partial search');
  await expect(page.locator('.card-title').filter({ hasText: '<img src=x' })).toBeVisible();
  assert.equal(await page.locator('.card-title img').count(), 0);

  let pageReads = 0;
  await page.route('https://r.jina.ai/**', async (route) => {
    pageReads++;
    assert.equal(route.request().headers()['x-robots-txt'], '*');
    const target = route.request().url().replace('https://r.jina.ai/', '');
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({
      code: 200,
      data: {
        url: target, title: 'Villa Alegria', content: '5 bedrooms. 8 guests. Licence 123456/AL.',
        images: { Pool: 'https://images.example.com/pool.jpg', Terrace: 'https://images.example.com/terrace.jpg', Bedroom: 'https://images.example.com/broken.jpg', Logo: 'https://images.example.com/logo.svg' },
      },
    }) });
  });
  await page.route('https://images.example.com/**', async (route) => {
    if (route.request().url().endsWith('broken.jpg')) return route.fulfill({ status: 404 });
    await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#789083"/></svg>' });
  });
  await page.locator('.read-property').first().click();
  await expect(page.locator('#reading-dialog')).toBeVisible();
  await expect(page.locator('#confirm-reading')).toBeDisabled();
  assert.equal(pageReads, 0);
  await page.locator('#reading-permission').check();
  await page.locator('#confirm-reading').click();
  await expect(page.locator('.photo-gallery:not([hidden])')).toHaveCount(1);
  assert.equal(pageReads, 1);
  await expect(page.locator('.unavailable-image')).toHaveText('Source image unavailable');
  await expect(page.locator('.conflict-block').first()).toContainText('5 bedrooms');
  assert.equal(await page.locator('.photo-gallery img').count(), 2);

  await page.unroute('https://s.jina.ai/**');
  await page.route('https://s.jina.ai/**', (route) => route.fulfill({ status: 401 }));
  await page.locator('#search-button').click();
  await expect(page.locator('#progress')).toBeHidden();
  await expect(page.locator('.result-card')).toHaveCount(0);
  await expect(page.locator('#result-warning')).toContainText('API key');
  await expect(page.locator('#empty-state h3')).toHaveText('The search could not finish.');

  await page.unroute('https://s.jina.ai/**');
  await page.route('https://s.jina.ai/**', (route) => route.fulfill({ contentType: 'application/json', body: '{"code":200,"data":[]}' }));
  await page.locator('#search-button').click();
  await expect(page.locator('#progress')).toBeHidden();
  await expect(page.locator('#empty-state h3')).toHaveText('No candidates returned.');
  await expect(page.locator('#result-warning')).toBeHidden();

  await page.unroute('https://s.jina.ai/**');
  await page.route('https://s.jina.ai/**', async (route) => {
    await new Promise((resolveWait) => setTimeout(resolveWait, 700));
    await route.fulfill({ contentType: 'application/json', body: '{"code":200,"data":[]}' });
  });
  await page.locator('#search-button').click();
  await expect(page.locator('#progress')).toBeVisible();
  await page.locator('[data-example=spain]').click();
  await page.waitForTimeout(1000);
  await expect(page.locator('#mode-badge')).toContainText('not live');
  await expect(page.locator('.card-title')).toHaveText('Son Doblons');
  await expect(page.locator('#country')).toHaveValue('Spain');
  await expect(page.locator('#progress')).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-example=portugal]').click();
  const mobileSize = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(mobileSize.scroll <= mobileSize.width, `Mobile overflow: ${JSON.stringify(mobileSize)}`);
  await expect(page.locator('.open-property').first()).toHaveAttribute('target', '_blank');
  if (process.env.SCREENSHOT_DIR) {
    await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/property-scout-mobile.png`, fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/property-scout-desktop.png`, fullPage: true });
  }

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('#connection-label')).toHaveText('Connect live search');
  await page.locator('[data-example=portugal]').click();
  await page.locator('#clear-selection').click();
  await expect(page.locator('#selected-count')).toHaveText('0');
  assert.equal(await page.evaluate(() => localStorage.getItem('property-scout:selected-links:v1')), null);
  assert.deepEqual(errors, []);
  await context.close();
  console.log('Browser checks passed: examples, live search contracts, scope, partial/auth/empty errors, cancellation, safe rendering, image consent/failures, conflicting facts, shortlist/CSV, key isolation, mobile layout.');
} catch (error) {
  if (debugPage && !debugPage.isClosed()) {
    console.error('Browser diagnostic:', await debugPage.locator('#result-warning').textContent());
    console.error('Console errors:', consoleErrors);
  }
  throw error;
} finally {
  if (browser) await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
