import assert from 'node:assert/strict';
import test from 'node:test';

const localBaseUrl = 'https://yoganandalondon-local.ddev.site';
const baseUrl = normaliseBaseUrl(process.env.QA_BASE_URL || localBaseUrl);
const basicAuthHeader = getBasicAuthHeader();

if (
  baseUrl.startsWith('https://') &&
  new URL(baseUrl).hostname.endsWith('.ddev.site') &&
  process.env.QA_ALLOW_INSECURE_TLS !== '0'
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const defaultPaths = [
  '/',
  '/about-us/',
  '/attend-a-meditation/',
  '/retreats/',
  '/connect/',
  '/contact-us/suggestion-box/',
  '/donate/',
];

if (process.env.QA_INCLUDE_CIVICRM === '1') {
  defaultPaths.push('/civicrm/');
}

const paths = process.env.QA_PATHS
  ? process.env.QA_PATHS.split(',')
      .map((path) => path.trim())
      .filter(Boolean)
  : defaultPaths;

const forbiddenPatterns = [
  /There has been a critical error/i,
  /Fatal error/i,
  /Parse error/i,
  /Warning:\s.*\/var\/www\/html/i,
  /Deprecated:\s.*\/var\/www\/html/i,
  /The requested URL was not found on this server/i,
  /Apache\/2\.4\.\d+ \(Debian\) Server/i,
];

test('configured page routes return healthy HTML', async (t) => {
  for (const path of paths) {
    await t.test(path, async () => {
      const { response, html } = await fetchHtml(path);

      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type') || '', /text\/html/i);
      assert.ok(html.length > 500, `${path} returned unexpectedly short HTML`);
      assert.match(html, /<\/html>/i);
      assertHealthyHtml(html, path);
    });
  }
});

test('homepage matches the London Centre site identity', async () => {
  const { html } = await fetchHtml('/');

  assert.match(html, /Self-Realization Fellowship|London Centre|Yogananda/i);
  assert.doesNotMatch(html, /DebtRegister|Debt Register/i);
});

test('primary navigation exposes highlighted Donate link', async () => {
  const { html } = await fetchHtml('/');

  assert.match(html, /menu-item-donate/);
  assert.match(html, /href=["'][^"']*\/donate\/["']/);
  assert.match(html, />Donate</);
  assert.equal(countMatches(html, /<li[^>]*class=["'][^"']*menu-item-donate/g), 2);
  assert.match(html, /id=["']mobmenuleft["'][\s\S]*menu-item-donate/);
});

test('donation page keeps the Gift Aid and paper-form contract', async () => {
  const { html } = await fetchHtml('/donate/');

  assert.match(html, /Make a Donation/);
  assert.match(html, /Gift Aid/);
  assert.match(html, /UK taxpayer/);
  assert.match(html, /Continue to secure donation/);
  assert.match(html, /Download the existing donation form/);
  assert.match(html, /Donations_to_the_London_Centre_SRF-Dec-2018\.pdf/);
  assert.doesNotMatch(html, /donate-button/);
  assert.doesNotMatch(html, /donation-demo/i);
  assert.equal(countMatches(html, /<li[^>]*class=["'][^"']*menu-item-donate/g), 2);
});

test('monastic visit popup exposes accessible modal markup when enabled', async () => {
  if (process.env.QA_EXPECT_POPUP !== '1') {
    return;
  }

  const { html } = await fetchHtml('/');

  assert.match(html, /data-monastic-visit-popup/);
  assert.match(html, /role=["']dialog["']/);
  assert.match(html, /aria-modal=["']true["']/);
  assert.match(html, /aria-labelledby=["']monastic-visit-popup-title["']/);
  assert.match(html, /aria-label=["']Close monastic visit notice["']/);
  assert.match(html, /data-popup-frequency=["'](?:daily|content_update|session)["']/);

  if (process.env.QA_EXPECT_POPUP_IMAGE === '1') {
    assert.match(html, /monastic-visit-popup__image/);
    assert.match(html, /monastic-visit-popup__image-element/);
  }
});

function normaliseBaseUrl(value) {
  return value.replace(/\/+$/, '');
}

function urlFor(path) {
  return new URL(path, `${baseUrl}/`).toString();
}

async function fetchHtml(path) {
  const response = await fetch(urlFor(path), {
    headers: {
      Accept: 'text/html',
      ...(basicAuthHeader ? { Authorization: basicAuthHeader } : {}),
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(Number(process.env.QA_TIMEOUT_MS || 15000)),
  });

  return {
    response,
    html: await response.text(),
  };
}

function assertHealthyHtml(html, path) {
  for (const pattern of forbiddenPatterns) {
    assert.doesNotMatch(html, pattern, `${path} matched ${pattern}`);
  }
}

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

function getBasicAuthHeader() {
  const username = process.env.QA_BASIC_AUTH_USER;
  const password = process.env.QA_BASIC_AUTH_PASSWORD;

  if (!username || !password) {
    return null;
  }

  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}
