# Donation Rollout Checklist

This checklist is the accountability record for the donation, Gift Aid, and payment rollout. Keep it current in the pull request. Do not add passwords, payment keys, webhook secrets, private donor data, or hosting credentials to this file.

## Rules

- Work locally first, then repeat the proven steps on staging, then production only after stakeholder sign-off.
- Take a database/files snapshot before every risky CiviCRM, payment, plugin, or deployment step.
- Use the same WordPress database for CiviCRM.
- Use official CiviCRM packages and stable releases.
- Do not edit `vendor/` or `node_modules/`.
- Use Stripe sandbox/test credentials locally and on staging.
- Add live payment credentials only during the final production payment configuration step.

## Branch Preparation

- [ ] Popup branch approved.
- [ ] Popup changes merged into `feature/donation-gift-aid-demo`.
- [ ] Donation branch rebased or merged cleanly against current `master`.
- [ ] Theme branch checks pass locally.
- [ ] Donation branch pushed to GitHub for review.

## Local Tooling

- [ ] Playwright Chromium installed with `npx playwright install chromium`.
- [ ] Stripe CLI installed.
- [ ] CiviCRM CLI `cv` installed.
- [ ] OSV-Scanner installed.
- [ ] Lighthouse CI installed.
- [ ] Gitleaks or TruffleHog installed.
- [ ] `npm run qa:donation:tools` passes without `QA_DONATION_ALLOW_MISSING_TOOLS=1`.

## Local CiviCRM

- [ ] Local database snapshot created before CiviCRM changes.
- [ ] Local CiviCRM upgraded to the chosen stable version.
- [ ] CiviCRM database upgrade completed if prompted.
- [ ] CiviCRM System Status reviewed.
- [ ] CiviCRM works with the Sage 11 theme active.
- [ ] Local database snapshot created after stable CiviCRM upgrade.

## Local Donation Flow

- [ ] FormBuilder enabled if required.
- [ ] FormBuilder Contributions enabled.
- [ ] Donation form created or cloned from the starter form.
- [ ] One-off donation amounts configured.
- [ ] Required contact fields configured.
- [ ] Required address/postcode fields configured for Gift Aid.
- [ ] Thank-you behaviour configured.
- [ ] Theme `/donate/` page wired to the CiviCRM donation journey.
- [ ] Existing donation PDF remains available.
- [ ] Desktop Donate menu item remains highlighted.
- [ ] Mobile Donate menu item remains highlighted.

## Gift Aid

- [ ] UK Gift Aid extension installed locally.
- [ ] Gift Aid declaration capture configured.
- [ ] Gift Aid wording approved by stakeholders.
- [ ] Donation with Gift Aid tested.
- [ ] Donation without Gift Aid tested.
- [ ] Missing address tested.
- [ ] Missing postcode tested.
- [ ] Existing contact tested.
- [ ] New contact tested.
- [ ] Non-UK address tested if relevant.

## Payment Processor

- [ ] Stripe extension installed locally.
- [ ] Stripe sandbox/test payment processor configured.
- [ ] Webhook secret configured in test mode only.
- [ ] Stripe CLI webhook forwarding tested locally.
- [ ] Successful payment tested.
- [ ] Failed payment tested.
- [ ] Cancelled payment tested.
- [ ] Thank-you page tested.
- [ ] CiviCRM contribution record checked.
- [ ] Transaction ID checked.
- [ ] Receipt email behaviour checked in a controlled email setup.

## Local QA Gate

- [ ] `npm run format` passes.
- [ ] `npm run qa:theme` passes.
- [ ] `npm run qa:audit` passes.
- [ ] `QA_EXPECT_DONATE=1 QA_EXPECT_CIVICRM=1 npm run qa:wp` passes.
- [ ] `QA_INCLUDE_CIVICRM=1 npm run qa:site` passes.
- [ ] `npm run qa:visual` passes on key pages.
- [ ] `npm run qa:a11y` passes on key pages.
- [ ] `npm run qa:donation` passes without missing-tool overrides.

## Staging

- [ ] Full staging files backup taken.
- [ ] Full staging database backup taken.
- [ ] Staging PHP version matches the locally proven target.
- [ ] Theme deployed from a clean archive.
- [ ] Official CiviCRM package deployed manually, not via WordPress plugin upload.
- [ ] CiviCRM upgraded or installed cleanly.
- [ ] Permalinks saved.
- [ ] WP Fastest Cache cleared.
- [ ] Minified files cleared.
- [ ] CiviCRM environment set to Staging.
- [ ] Stripe sandbox/test credentials configured.
- [ ] Outbound email disabled or controlled.
- [ ] Staging QA completed.
- [ ] Stakeholder sign-off recorded outside the public repo.

## Production

- [ ] Staging signed off.
- [ ] Maintenance window scheduled.
- [ ] Full production files backup taken.
- [ ] Full production database backup taken.
- [ ] `wp-config.php` backed up.
- [ ] Uploads backed up.
- [ ] Theme and plugins backed up.
- [ ] Same proven theme archive deployed.
- [ ] Same proven CiviCRM version deployed.
- [ ] Same proven settings applied.
- [ ] Live Stripe credentials added only at final payment step.
- [ ] One small live donation tested.
- [ ] Payment receipt confirmed.
- [ ] CiviCRM contribution record confirmed.
- [ ] Gift Aid capture confirmed.
- [ ] Logs checked immediately after launch.
- [ ] Site monitored for 24-72 hours.
