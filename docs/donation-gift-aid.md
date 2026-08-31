# Donation and Gift Aid

## Goal

Create a responsive theme page for a one-off donation journey with an optional Gift Aid declaration. The page is for local review before wiring the page to CiviCRM contribution, Gift Aid, and payment processing.

## Scope

- Replace the existing hardcoded Donate button with a highlighted Donate item in the primary navigation.
- Point the Donate navigation item to `/donate/`.
- Add a dedicated `Donation Template` page template.
- Keep the existing donation PDF available from the new page.
- Use British English for page copy and labels.
- Match the current site style: serif typography, calm blue headings, soft off-white panels, and restrained buttons.

## Out of Scope

- No live payment processing.
- No Gift Aid data capture in CiviCRM yet.
- No production or staging changes.
- No edits to `vendor/` or `node_modules/`.

## Review Criteria

- Desktop and mobile layouts feel consistent with the existing website.
- Gift Aid wording is clearly marked as draft copy for stakeholder approval.
- The existing donation PDF remains easy to find.
- The page can later be replaced or wired to a real CiviCRM contribution page.

## Implementation Recommendation

- Keep payment collection inside CiviCRM and the payment processor extension; do not build custom card handling in the theme.
- Use the latest stable CiviCRM locally first, then repeat the exact process on staging after a database/files snapshot.
- Prefer a CiviCRM FormBuilder contribution form for the real donation journey. It gives us a supported donation form, test-mode support, CiviCRM contribution records, and a safer route to Stripe checkout than custom theme code.
- Use the theme donation page as the branded wrapper and supporting content. Link or embed the CiviCRM form only after CiviCRM, Gift Aid, and the sandbox payment processor are stable.
- Use Stripe sandbox/test credentials only until production sign-off. Live keys must be added only at the final production payment-processor step.
- Keep Gift Aid wording and consent language stakeholder-approved before production deployment.

## Donation QA Gate

Before this branch is considered ready for staging sign-off, run:

```sh
npm run qa:donation
```

This requires the external payment/security tooling listed in `docs/qa-harness.md`: Stripe CLI, CiviCRM CLI `cv`, OSV-Scanner, Lighthouse CI, and either Gitleaks or TruffleHog.

Use only Stripe sandbox/test credentials locally and on staging. Live keys must not be committed, pasted into documentation, or used before production sign-off.

Track the end-to-end rollout in `docs/donation-rollout-checklist.md`.
