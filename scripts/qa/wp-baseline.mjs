import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const artifactDir = process.env.QA_ARTIFACT_DIR || '/tmp/yogananda-qa';
const skipPlugins = process.env.QA_SKIP_PLUGINS ?? 'sugar-calendar-lite';
const expectedTheme = process.env.QA_EXPECT_THEME || 'yoganandalondon.org';
const expectDonate = process.env.QA_EXPECT_DONATE !== '0';
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

    if (report.donatePage.template !== 'template-donation-demo.blade.php') {
      failures.push(
        `Expected /donate/ template-donation-demo.blade.php, found ${report.donatePage.template || 'none'}.`,
      );
    }
  }

  if (expectCivi && !report.civicrm.available) {
    failures.push('Expected CiviCRM WP-CLI to be available, but the version command failed.');
  }
} finally {
  mkdirSync(artifactDir, { recursive: true });
  const reportPath = join(artifactDir, `wp-baseline-${stamp()}.json`);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  printSummary(report, reportPath, failures);
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

function wp(args) {
  return run(['ddev', 'wp', ...wpBaseArgs, ...args]).stdout.trim();
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
  console.log(`- WordPress: ${value.wordpressVersion || 'unknown'}`);
  console.log(`- PHP: ${value.phpVersion || 'unknown'}`);
  console.log(
    `- Active theme: ${value.activeTheme?.name || 'unknown'} ${value.activeTheme?.version || ''}`.trim(),
  );
  console.log(`- Active plugins: ${activePlugins.length}`);
  console.log(
    `- Donate page: ${value.donatePage?.id || 'missing'} (${value.donatePage?.template || 'no template'})`,
  );
  console.log(
    `- CiviCRM: ${value.civicrm?.available ? value.civicrm.output.replace(/\n/g, ' | ') : 'not available'}`,
  );
  console.log(`- Report: ${reportPath}`);

  if (issues.length > 0) {
    console.error('\nFailures');
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
  }
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}
