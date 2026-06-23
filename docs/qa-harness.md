# QA harness

This theme includes a small QA harness for local and staging checks during the CiviCRM and donation rollout.

## Commands

Run from the theme repository:

```sh
npm run qa:theme
npm run qa:static
npm run qa:audit
npm run qa:wp
npm run qa:site
npm run qa:visual
```

`qa:theme` runs static checks, source contract tests, and the production build.

`qa:static` runs PHP syntax checks and then uses Pint, PHP_CodeSniffer, and PHPStan when their binaries are installed. Missing optional tools are reported as skipped rather than treated as failures.

`qa:audit` runs vulnerability checks for npm packages and Composer packages. It uses Composer's lock-file audit so the result matches the dependency set that would be installed from this branch. Set `QA_NPM_AUDIT_OMIT=dev` when you intentionally want a production-only npm audit, and set `QA_OSV_SCANNER=1` to also run `osv-scanner` when it is installed.

`lint` runs ESLint and Stylelint for frontend/source QA. `format` checks Prettier formatting.

The Git pre-commit hook runs:

```sh
npm run precommit
```

That command runs static checks, source contract tests, ESLint, and Stylelint. Use `npm run qa:local` before opening a PR.

The Git pre-push hook runs:

```sh
npm run prepush
```

That command runs `qa:audit`, so known dependency advisories are caught before pushing a branch.

`qa:wp` uses DDEV and WP-CLI to record WordPress, PHP, active theme, plugin, Donate page, and CiviCRM baseline information. It writes a JSON report to `/tmp/yogananda-qa` by default.

`qa:site` checks important public routes, fails on visible fatal/error output, and verifies the Donate/Gift Aid page contract.

`qa:visual` captures desktop and mobile screenshots for the configured pages. It requires Playwright to be installed locally:

```sh
npm install --save-dev playwright
npx playwright install chromium
```

Screenshots and JSON reports are written outside the repository by default.

## Useful environment variables

```sh
QA_BASE_URL=https://yoganandalondon-local.ddev.site
QA_BASE_URL=https://staging.yoganandalondon.org
QA_PATHS=/,/about-us/,/donate/
QA_INCLUDE_CIVICRM=1
QA_EXPECT_CIVICRM=1
QA_ARTIFACT_DIR=/tmp/yogananda-qa
QA_SKIP_PLUGINS=sugar-calendar-lite
QA_BASIC_AUTH_USER=temporary-user
QA_BASIC_AUTH_PASSWORD=temporary-password
QA_NPM_AUDIT_LEVEL=high
QA_NPM_AUDIT_OMIT=dev
QA_OSV_SCANNER=1
```

Use `QA_BASE_URL` for staging. If staging is protected with HTTP Basic Auth, set `QA_BASIC_AUTH_USER` and `QA_BASIC_AUTH_PASSWORD` in your shell for that command only.

## Notes

- The harness does not send test emails or submit real donations.
- The Gift Aid wording remains draft stakeholder copy until approved.
- Keep generated screenshots, reports, `vendor/`, `node_modules/`, and built assets out of Git.
- WPScan is useful for WordPress plugin/theme vulnerability intelligence, but it needs a WPScan API token and should be run intentionally during staging or maintenance checks rather than in the default local hook.
