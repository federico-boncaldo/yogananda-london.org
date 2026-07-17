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
npm run qa:a11y
npm run qa:visual
npm run qa:donation:tools
npm run qa:donation
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

`qa:a11y` runs Axe accessibility checks through Playwright. It checks `/donate/` by default and writes a JSON report to `/tmp/yogananda-qa`.

`qa:visual` captures desktop and mobile screenshots for the configured pages. It fails when browser console warnings/errors are recorded unless `QA_VISUAL_ALLOW_CONSOLE=1` is set for an intentionally noisy environment.

Screenshots and JSON reports are written outside the repository by default.

After installing npm dependencies, install the browser binary used by the Playwright checks:

```sh
npx playwright install chromium
```

`qa:donation:tools` checks the external tools needed for a release-grade donation/payment flow:

- Stripe CLI, for webhook forwarding and sandbox event tests.
- CiviCRM CLI `cv`, for reliable CiviCRM config/API assertions.
- OSV-Scanner, for dependency vulnerability checks beyond npm/composer audit.
- Lighthouse CI, for performance and browser best-practices checks.
- Gitleaks or TruffleHog, for secret scanning before Stripe keys or webhook secrets enter the workflow.

Install examples on macOS:

```sh
brew install stripe/stripe-cli/stripe
brew install civicrm/civicrm-cv/cv
brew install gitleaks
brew install osv-scanner
npm install -g @lhci/cli
```

Use TruffleHog instead of Gitleaks if preferred:

```sh
brew install trufflesecurity/trufflehog/trufflehog
QA_DONATION_SECRET_SCANNER=trufflehog npm run qa:donation:tools
```

For local exploratory work only, missing external tools can be reported as skipped:

```sh
QA_DONATION_ALLOW_MISSING_TOOLS=1 npm run qa:donation:tools
```

Do not use that override for staging sign-off or production readiness.

`qa:donation` is the full donation gate. It runs theme checks, dependency/security checks, the external-tool gate, WordPress/CiviCRM baseline checks, site-health checks including CiviCRM, visual checks on `/donate/`, and Axe accessibility checks on `/donate/`.

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
QA_DONATION_ALLOW_MISSING_TOOLS=1
QA_DONATION_SECRET_SCANNER=gitleaks
QA_DONATION_SECRET_SCANNER=trufflehog
QA_VISUAL_ALLOW_CONSOLE=1
QA_A11Y_PATHS=/donate/
```

Use `QA_BASE_URL` for staging. If staging is protected with HTTP Basic Auth, set `QA_BASIC_AUTH_USER` and `QA_BASIC_AUTH_PASSWORD` in your shell for that command only.

## Notes

- The harness does not send test emails or submit real donations.
- The Gift Aid wording remains draft stakeholder copy until approved.
- Stripe CLI tests must use sandbox/test mode only.
- Keep generated screenshots, reports, `vendor/`, `node_modules/`, and built assets out of Git.
- WPScan is useful for WordPress plugin/theme vulnerability intelligence, but it needs a WPScan API token and should be run intentionally during staging or maintenance checks rather than in the default local hook.
