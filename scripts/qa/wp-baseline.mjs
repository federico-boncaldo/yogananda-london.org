import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const artifactDir = process.env.QA_ARTIFACT_DIR || '/tmp/yogananda-qa';
const skipPlugins = process.env.QA_SKIP_PLUGINS ?? 'sugar-calendar-lite';
const expectedTheme = process.env.QA_EXPECT_THEME || 'yoganandalondon.org';
const expectedDonateTemplate =
  process.env.QA_EXPECT_DONATE_TEMPLATE || 'template-donation.blade.php';
const expectDonate = process.env.QA_EXPECT_DONATE === '1';
const expectPopup = process.env.QA_EXPECT_POPUP === '1';
const expectCivi = process.env.QA_EXPECT_CIVICRM === '1';
const wpBaseArgs = skipPlugins ? [`--skip-plugins=${skipPlugins}`] : [];

const report = {
  generatedAt: new Date().toISOString(),
  skippedPluginsForCli: skipPlugins || null,
};

const failures = [];

try {
  report.wordpressVersion = wp(['core', 'version']);
  report.phpVersion = wp(['eval', 'echo PHP_VERSION;']);
  report.permalinkStructure = wp(['eval', 'echo get_option("permalink_structure");']);
  report.activeTheme =
    parseJson(
      wp(['theme', 'list', '--status=active', '--fields=name,version', '--format=json']),
    )[0] || null;
  report.plugins = parseJson(
    wp(['plugin', 'list', '--fields=name,status,version,update', '--format=json']),
  );
  report.donatePage = getDonatePage();
  report.monasticVisitPopup = getMonasticVisitPopup();
  report.civicrm = getCiviCrmVersion();

  if (report.activeTheme?.name !== expectedTheme) {
    failures.push(
      `Expected active theme ${expectedTheme}, found ${report.activeTheme?.name || 'none'}.`,
    );
  }

  if (expectDonate) {
    if (!report.donatePage.id) {
      failures.push('Expected a published /donate/ page, but none was found.');
    }

    if (report.donatePage.template !== expectedDonateTemplate) {
      failures.push(
        `Expected /donate/ ${expectedDonateTemplate}, found ${report.donatePage.template || 'none'}.`,
      );
    }
  }

  if (expectCivi && !report.civicrm.available) {
    failures.push('Expected CiviCRM WP-CLI to be available, but the version command failed.');
  }

  if (expectPopup && !report.monasticVisitPopup.enabled) {
    failures.push('Expected the monastic visit popup to be enabled.');
  }
} finally {
  mkdirSync(artifactDir, { recursive: true });
  const reportPath = join(artifactDir, `wp-baseline-${stamp()}.json`);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  printSummary(report, reportPath, failures);
}

function getMonasticVisitPopup() {
  const rawValue = wp(['option', 'get', 'yogananda_monastic_visit_popup', '--format=json'], {
    allowFailure: true,
  });

  if (!rawValue) {
    return {
      enabled: false,
      title: null,
    };
  }

  try {
    const value = JSON.parse(rawValue);

    return {
      enabled: value.enabled === '1' || value.enabled === 1 || value.enabled === true,
      title: value.title || null,
    };
  } catch {
    return {
      enabled: false,
      title: null,
    };
  }
}

if (failures.length > 0) {
  process.exitCode = 1;
}

function getDonatePage() {
  const id =
    wp(['post', 'list', '--post_type=page', '--post_status=any', '--pagename=donate', '--field=ID'])
      .split(/\s+/)
      .filter(Boolean)[0] || null;

  if (!id) {
    return { id: null, template: null };
  }

  return {
    id,
    template: wp(['post', 'meta', 'get', id, '_wp_page_template']) || null,
  };
}

function getCiviCrmVersion() {
  const result = run(['ddev', 'wp', ...wpBaseArgs, 'civicrm', 'core', 'version'], {
    allowFailure: true,
  });

  return {
    available: result.status === 0,
    output: result.stdout.trim(),
    error: result.status === 0 ? null : result.stderr.trim(),
  };
}

function wp(args, options = {}) {
  const result = run(['ddev', 'wp', ...wpBaseArgs, ...args], options);

  return result.status === 0 ? result.stdout.trim() : '';
}

function run(command, options = {}) {
  const [program, ...args] = command;
  const result = spawnSync(program, args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`${command.join(' ')} failed:\n${result.stderr || result.stdout}`);
  }

  return result;
}

function parseJson(value) {
  const objectStart = value.indexOf('{');
  const arrayStart = value.indexOf('[');
  const starts = [objectStart, arrayStart].filter((index) => index >= 0);
  const start = starts.length > 0 ? Math.min(...starts) : -1;

  if (start < 0) {
    throw new Error(`Expected JSON output, received:\n${value}`);
  }

  return JSON.parse(value.slice(start));
}

function printSummary(value, reportPath, issues) {
  const activePlugins = (value.plugins || []).filter((plugin) => plugin.status === 'active');

  console.log('WordPress QA baseline');
  console.log(`- WordPress: ${fallback(value.wordpressVersion)}`);
  console.log(`- PHP: ${fallback(value.phpVersion)}`);
  console.log(`- Active theme: ${formatTheme(value.activeTheme)}`);
  console.log(`- Active plugins: ${activePlugins.length}`);
  console.log(`- Donate page: ${formatDonatePage(value.donatePage)}`);
  console.log(`- Monastic visit popup: ${formatPopup(value.monasticVisitPopup)}`);
  console.log(`- CiviCRM: ${formatCiviCrm(value.civicrm)}`);
  console.log(`- Report: ${reportPath}`);

  printFailures(issues);
}

function fallback(value, defaultValue = 'unknown') {
  return value || defaultValue;
}

function formatTheme(theme) {
  return `${fallback(theme?.name)} ${theme?.version || ''}`.trim();
}

function formatDonatePage(donatePage) {
  return `${donatePage?.id || 'missing'} (${donatePage?.template || 'no template'})`;
}

function formatPopup(popup) {
  return popup?.enabled ? 'enabled' : 'disabled';
}

function formatCiviCrm(civicrm) {
  if (!civicrm?.available) {
    return 'not available';
  }

  return civicrm.output.replace(/\n/g, ' | ');
}

function printFailures(issues) {
  if (issues.length === 0) {
    return;
  }

  console.error('\nFailures');
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}
