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
  const filters = read('app/filters.php');
  const donationTemplate = read('resources/views/template-donation-demo.blade.php');
  const styles = read('resources/assets/styles/main.scss');

  assert.match(header, /London_Centre_Logo_white\.png/);
  assert.match(header, /YoganandaLondon/);
  assert.match(header, /instagram\.com\/yoganandalondon/);
  assert.match(filters, /menu-item-donate/);
  assert.match(filters, /home_url\('\/donate\/'\)/);
  assert.match(filters, /Donate/);
  assert.match(donationTemplate, /Gift Aid/);
  assert.match(donationTemplate, /Donations_to_the_London_Centre_SRF-Dec-2018\.pdf/);
  assert.match(styles, /layouts\/header/);
  assert.match(styles, /layouts\/donation/);
  assert.match(styles, /layouts\/pages/);
});

test('comments keep the WordPress comments_template flow', () => {
  assert.ok(existsSync('comments.php'));
  assert.match(read('comments.php'), /partials\.comments/);
  assert.match(read('resources/views/partials/content-single.blade.php'), /comments_template\(\)/);
  assert.doesNotMatch(read('resources/views/partials/content-single.blade.php'), /partials\/comments\.blade\.php/);
});
