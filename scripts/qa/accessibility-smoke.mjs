import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { AxeBuilder } from '@axe-core/playwright';
import { chromium } from 'playwright';

const artifactDir = process.env.QA_ARTIFACT_DIR || '/tmp/yogananda-qa';
const baseUrl = normaliseBaseUrl(
  process.env.QA_BASE_URL || 'https://yoganandalondon-local.ddev.site',
);
const basicAuthHeader = getBasicAuthHeader();
const ignoreHTTPSErrors = process.env.QA_IGNORE_HTTPS_ERRORS !== '0';
const expectPopup = process.env.QA_EXPECT_POPUP === '1';
const expectPopupImage = process.env.QA_EXPECT_POPUP_IMAGE === '1';
const timeout = Number(process.env.QA_TIMEOUT_MS || 30000);

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];

mkdirSync(artifactDir, { recursive: true });

if (!expectPopup) {
  console.log('Accessibility smoke skipped: set QA_EXPECT_POPUP=1 to scan the popup feature.');
  process.exit(0);
}

const browser = await chromium.launch();
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  checks: [],
};

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      ignoreHTTPSErrors,
      viewport: { width: viewport.width, height: viewport.height },
    });

    if (basicAuthHeader) {
      await context.setExtraHTTPHeaders({
        Authorization: basicAuthHeader,
      });
    }

    const page = await context.newPage();
    await clearPopupStorage(page);
    await page.goto(`${baseUrl}/`, { timeout, waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-monastic-visit-popup]:not([hidden])', { timeout });

    await recordAxeCheck({
      label: `${viewport.name} popup`,
      page,
      report,
      selector: '[data-monastic-visit-popup]',
      viewport,
    });

    if (expectPopupImage) {
      await page.locator('[data-monastic-popup-image-trigger]').click();
      await page.waitForSelector('[data-monastic-popup-image-viewer]:not([hidden])', {
        timeout,
      });

      await recordAxeCheck({
        label: `${viewport.name} expanded popup image`,
        page,
        report,
        selector: '[data-monastic-popup-image-viewer]',
        viewport,
      });
    }

    await context.close();
  }
} finally {
  await browser.close();
}

const reportPath = join(artifactDir, `accessibility-smoke-${stamp()}.json`);
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

for (const check of report.checks) {
  assert.deepEqual(check.violations, [], `${check.label} has accessibility violations`);
}

console.log(`Accessibility QA report: ${reportPath}`);

async function recordAxeCheck({ label, page, report, selector, viewport }) {
  const results = await new AxeBuilder({ page }).include(selector).analyze();
  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      summary: node.failureSummary,
    })),
  }));

  report.checks.push({
    label,
    selector,
    viewport,
    violations,
  });
}

async function clearPopupStorage(page) {
  await page.addInitScript(() => {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      for (const key of Object.keys(storage)) {
        if (key.startsWith('yogananda:monastic-visit-popup')) {
          storage.removeItem(key);
        }
      }
    }
  });
}

function normaliseBaseUrl(value) {
  return value.replace(/\/+$/, '');
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
