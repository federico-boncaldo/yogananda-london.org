import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const read = (path) => readFileSync(path, 'utf8');

test('theme is migrated to Sage 11 runtime dependencies', () => {
  const composer = readJson('composer.json');

  assert.equal(composer.require.php, '>=8.3');
  assert.equal(composer.require['roots/acorn'], '^6.0');
  assert.ok(!('roots/sage-lib' in composer.require));
  assert.ok(!('soberwp/controller' in composer.require));
  assert.ok(!('illuminate/support' in composer.require));
});

test('theme uses Sage 11 Vite build entrypoints', () => {
  const pkg = readJson('package.json');

  assert.equal(pkg.scripts.dev, 'vite');
  assert.equal(pkg.scripts.build, 'vite build');
  assert.equal(pkg.engines.node, '^20.19.0 || >=22.12.0');
  assert.equal(pkg.devDependencies['@roots/vite-plugin'], '^2.0.0');
  assert.equal(pkg.devDependencies['laravel-vite-plugin'], '^3.0.0');
  assert.equal(pkg.devDependencies.vite, '^8.0.0');

  assert.ok(existsSync('vite.config.js'));
  assert.match(read('vite.config.js'), /resources\/assets\/styles\/main\.scss/);
  assert.match(read('vite.config.js'), /resources\/assets\/scripts\/main\.js/);
});

test('WordPress loads from Sage 11 root theme files', () => {
  assert.ok(existsSync('functions.php'));
  assert.ok(existsSync('index.php'));
  assert.ok(existsSync('style.css'));

  assert.match(read('functions.php'), /Application::configure\(\)/);
  assert.match(read('index.php'), /app\('sage\.view'\)/);
  assert.match(read('style.css'), /Version:\s+11\.2\.1/);
  assert.match(read('style.css'), /Theme Name:\s+SRF London/);
});

test('custom UI markers remain in templates and styles', () => {
  const header = read('resources/views/partials/header.blade.php');
  const styles = read('resources/assets/styles/main.scss');

  assert.match(header, /London_Centre_Logo_white\.png/);
  assert.match(header, /YoganandaLondon/);
  assert.match(header, /instagram\.com\/yoganandalondon/);
  assert.match(header, /Donate/);
  assert.match(styles, /layouts\/header/);
  assert.match(styles, /layouts\/pages/);
});

test('comments keep the WordPress comments_template flow', () => {
  assert.ok(existsSync('comments.php'));
  assert.match(read('comments.php'), /partials\.comments/);
  assert.match(read('resources/views/partials/content-single.blade.php'), /comments_template\(\)/);
  assert.doesNotMatch(
    read('resources/views/partials/content-single.blade.php'),
    /partials\/comments\.blade\.php/,
  );
});

test('QA harness includes static analysis and staged-file hooks', () => {
  const composer = readJson('composer.json');
  const pkg = readJson('package.json');
  const phpstan = read('phpstan.neon.dist');
  const eslint = read('eslint.config.js');

  assert.equal(pkg.scripts['qa:static'], 'node scripts/qa/static-check.mjs');
  assert.equal(pkg.scripts['qa:audit'], 'node scripts/qa/security-audit.mjs');
  assert.equal(pkg.scripts.lint, 'npm run lint:js && npm run lint:styles');
  assert.equal(pkg.scripts['lint:js'], 'eslint .');
  assert.equal(pkg.scripts['lint:styles'], 'stylelint "resources/assets/styles/**/*.scss"');
  assert.equal(
    pkg.scripts.format,
    'prettier --check eslint.config.js "scripts/qa/**/*.mjs" "tests/**/*.mjs" package.json .prettierrc.json .stylelintrc.json',
  );
  assert.equal(pkg.scripts.prepare, 'husky');
  assert.equal(
    composer.scripts['qa:php'],
    'phpstan analyse --debug --memory-limit=1G && phpcs && vendor/bin/pint --test',
  );
  assert.ok('phpstan/phpstan' in composer['require-dev']);
  assert.ok('tomasvotruba/cognitive-complexity' in composer['require-dev']);
  assert.ok('wp-coding-standards/wpcs' in composer['require-dev']);
  assert.match(phpstan, /level:\s+max/);
  assert.match(phpstan, /tomasvotruba\/cognitive-complexity\/config\/extension\.neon/);
  assert.match(phpstan, /cognitive_complexity:/);
  assert.match(phpstan, /function:\s+10/);
  assert.match(phpstan, /class:\s+50/);
  assert.match(phpstan, /maximumNumberOfProcesses:\s+8/);
  assert.ok('eslint-plugin-sonarjs' in pkg.devDependencies);
  assert.match(eslint, /sonarjs/);
  assert.match(eslint, /complexity:\s+\['error'/);
  assert.match(eslint, /'sonarjs\/cognitive-complexity'/);
  assert.ok(existsSync('phpstan.neon.dist'));
  assert.ok(existsSync('eslint.config.js'));
  assert.ok(existsSync('.stylelintrc.json'));
  assert.ok(existsSync('.prettierrc.json'));
  assert.ok(existsSync('.husky/pre-commit'));
  assert.ok(existsSync('.husky/pre-push'));
});

test('QA harness defaults stay independent from the donation flow', () => {
  const siteHealth = read('scripts/qa/site-health.test.mjs');
  const wpBaseline = read('scripts/qa/wp-baseline.mjs');
  const visualSmoke = read('scripts/qa/visual-smoke.mjs');

  assert.doesNotMatch(siteHealth, /'\/donate\/'/);
  assert.doesNotMatch(siteHealth, /donation demo page/i);
  assert.match(wpBaseline, /QA_EXPECT_DONATE === '1'/);
  assert.match(visualSmoke, /QA_VISUAL_WAIT_UNTIL/);
  assert.match(visualSmoke, /domcontentloaded/);
  assert.doesNotMatch(visualSmoke, /Gift Aid/);
  assert.doesNotMatch(visualSmoke, /\/donate\//);
});

test('monastic visit popup is wired through WordPress settings and theme assets', () => {
  assert.match(read('functions.php'), /'monastic-popup'/);
  assert.ok(existsSync('app/monastic-popup.php'));
  assert.ok(existsSync('resources/views/partials/monastic-visit-popup.blade.php'));
  assert.ok(existsSync('resources/assets/scripts/components/monastic-popup.js'));
  assert.ok(existsSync('resources/assets/styles/components/_monastic-popup.scss'));

  const popupPhp = read('app/monastic-popup.php');
  const partial = read('resources/views/partials/monastic-visit-popup.blade.php');
  const popupJs = read('resources/assets/scripts/components/monastic-popup.js');
  const commonJs = read('resources/assets/scripts/routes/common.js');
  const mainScss = read('resources/assets/styles/main.scss');
  const popupScss = read('resources/assets/styles/components/_monastic-popup.scss');
  const viteConfig = read('vite.config.js');

  assert.match(popupPhp, /yogananda_monastic_visit_popup/);
  assert.match(popupPhp, /add_theme_page/);
  assert.match(popupPhp, /register_setting/);
  assert.match(popupPhp, /wp_kses_post/);
  assert.match(popupPhp, /wp_footer/);
  assert.match(popupPhp, /image_id/);
  assert.match(popupPhp, /display_frequency/);
  assert.match(popupPhp, /wp_enqueue_media/);
  assert.match(popupPhp, /wp_get_attachment_image/);
  assert.match(popupPhp, /monastic_visit_popup_frequency_options/);
  assert.match(popupPhp, /monastic_visit_popup_admin_image_preview/);
  assert.match(partial, /data-monastic-visit-popup/);
  assert.match(partial, /data-popup-frequency/);
  assert.match(partial, /role="dialog"/);
  assert.match(partial, /aria-modal="true"/);
  assert.match(partial, /aria-labelledby="monastic-visit-popup-title"/);
  assert.match(partial, /Close monastic visit notice/);
  assert.match(partial, /monastic-visit-popup__image/);
  assert.match(popupJs, /frequency/);
  assert.match(popupJs, /sessionStorage/);
  assert.match(commonJs, /initMonasticVisitPopup/);
  assert.match(mainScss, /components\/monastic-popup/);
  assert.match(popupScss, /&__image/);
  assert.match(
    popupScss,
    /@media screen and \(max-width: 600px\)[\s\S]*\.monastic-visit-popup\s*\{[\s\S]*align-items:\s*center;/,
  );
  assert.match(viteConfig, /resources\/assets\/scripts\/admin\/monastic-popup-admin\.js/);
  assert.ok(existsSync('resources/assets/scripts/admin/monastic-popup-admin.js'));
});
