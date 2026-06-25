import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const playwright = await loadPlaywright();
const artifactDir = process.env.QA_ARTIFACT_DIR || '/tmp/yogananda-qa';
const baseUrl = normaliseBaseUrl(
  process.env.QA_BASE_URL || 'https://yoganandalondon-local.ddev.site',
);
const basicAuthHeader = getBasicAuthHeader();
const paths = (process.env.QA_VISUAL_PATHS || '/,/attend-a-meditation/,/about-us/')
  .split(',')
  .map((path) => path.trim())
  .filter(Boolean);

const viewports = [
  { name: 'desktop', width: 1440, height: 1100 },
  { name: 'mobile', width: 390, height: 1000 },
];

mkdirSync(artifactDir, { recursive: true });

const browser = await playwright.chromium.launch();
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  checks: [],
};

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const messages = [];

    if (basicAuthHeader) {
      await page.setExtraHTTPHeaders({
        Authorization: basicAuthHeader,
      });
    }

    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) {
        messages.push(`${message.type()}: ${message.text()}`);
      }
    });

    page.on('pageerror', (error) => {
      messages.push(`pageerror: ${error.message}`);
    });

    for (const path of paths) {
      const url = new URL(path, `${baseUrl}/`).toString();
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: Number(process.env.QA_TIMEOUT_MS || 30000),
      });

      assert.equal(response?.status(), 200, `${url} did not return HTTP 200`);

      const bodyText = await page.locator('body').innerText();
      assertHealthyText(bodyText, url);

      if (path === '/' && process.env.QA_EXPECT_POPUP === '1') {
        await expectVisible(page, '[data-monastic-visit-popup]', 'monastic visit popup');
        await expectVisible(
          page,
          '[aria-label="Close monastic visit notice"]',
          'monastic visit popup close button',
        );
      }

      const screenshot = join(artifactDir, `${safeName(path)}-${viewport.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });

      report.checks.push({
        path,
        viewport,
        screenshot,
        consoleMessages: messages.splice(0),
      });
    }

    await page.close();
  }
} finally {
  await browser.close();
}

const reportPath = join(artifactDir, `visual-smoke-${stamp()}.json`);
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Visual QA report: ${reportPath}`);

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    console.error(
      [
        'Playwright is not installed in this theme checkout.',
        'For repeatable visual QA, install it in the theme repo:',
        '  npm install --save-dev playwright',
        '  npx playwright install chromium',
        '',
        'Then run:',
        '  npm run qa:visual',
      ].join('\n'),
    );
    process.exit(1);
  }
}

async function expectVisible(page, selector, label) {
  const locator = page.locator(selector).first();
  assert.equal(await locator.isVisible(), true, `${label} was not visible`);
}

function assertHealthyText(text, url) {
  for (const pattern of [
    /There has been a critical error/i,
    /Fatal error/i,
    /Parse error/i,
    /The requested URL was not found on this server/i,
  ]) {
    assert.doesNotMatch(text, pattern, `${url} matched ${pattern}`);
  }
}

function normaliseBaseUrl(value) {
  return value.replace(/\/+$/, '');
}

function safeName(path) {
  return path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/[^a-z0-9-]+/gi, '-');
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function getBasicAuthHeader() {
  const username = process.env.QA_BASIC_AUTH_USER;
  const password = process.env.QA_BASIC_AUTH_PASSWORD;

  if (!username || !password) {
    return null;
  }

  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}
