import { spawnSync } from 'node:child_process';

const allowMissingTools = process.env.QA_DONATION_ALLOW_MISSING_TOOLS === '1';
const requestedSecretScanner = process.env.QA_DONATION_SECRET_SCANNER || 'auto';

const checks = [
  {
    name: 'Stripe CLI',
    command: 'stripe',
    args: ['--version'],
    purpose: 'Required for local webhook forwarding and Stripe sandbox event testing.',
  },
  {
    name: 'CiviCRM CLI',
    command: 'cv',
    args: ['--version'],
    purpose: 'Required for CiviCRM API/config assertions that are awkward through WordPress alone.',
  },
  {
    name: 'OSV scanner',
    command: 'osv-scanner',
    args: ['scan', 'source', '--recursive', '.'],
    purpose: 'Adds lock-file and source dependency vulnerability checks beyond npm/composer audit.',
  },
  {
    name: 'Lighthouse CI',
    command: 'lhci',
    args: ['--version'],
    purpose: 'Required for donation-page performance and best-practices checks.',
  },
  secretScannerCheck(),
];

const results = checks.map(runCheck);
const failed = results.filter((result) => result.status === 'failed');

console.log('Donation external-tool gate');
for (const result of results) {
  console.log(
    `- ${result.status.toUpperCase()}: ${result.name}${result.detail ? ` (${result.detail})` : ''}`,
  );
  if (result.purpose) {
    console.log(`  ${result.purpose}`);
  }
}

if (failed.length > 0) {
  console.error(
    [
      '',
      'Install the missing/failing tools before treating the donation flow as release-ready.',
      'For local exploratory work only, rerun with QA_DONATION_ALLOW_MISSING_TOOLS=1.',
    ].join('\n'),
  );
  process.exitCode = 1;
}

function secretScannerCheck() {
  if (requestedSecretScanner === 'none') {
    return {
      name: 'Secret scanner',
      command: null,
      args: [],
      purpose: 'Skipped only because QA_DONATION_SECRET_SCANNER=none was set.',
    };
  }

  const candidates =
    requestedSecretScanner === 'auto'
      ? [
          {
            name: 'Gitleaks secret scan',
            command: 'gitleaks',
            args: ['detect', '--source', '.', '--redact', '--no-banner'],
          },
          {
            name: 'TruffleHog secret scan',
            command: 'trufflehog',
            args: ['filesystem', '.', '--only-verified', '--no-update'],
          },
        ]
      : [
          requestedSecretScanner === 'trufflehog'
            ? {
                name: 'TruffleHog secret scan',
                command: 'trufflehog',
                args: ['filesystem', '.', '--only-verified', '--no-update'],
              }
            : {
                name: 'Gitleaks secret scan',
                command: 'gitleaks',
                args: ['detect', '--source', '.', '--redact', '--no-banner'],
              },
        ];

  const available = candidates.find((candidate) => commandExists(candidate.command));

  return {
    ...(available || candidates[0]),
    purpose: 'Required before payment work so Stripe keys and webhook secrets are not committed.',
  };
}

function runCheck(check) {
  if (!check.command) {
    return {
      name: check.name,
      status: allowMissingTools ? 'skipped' : 'failed',
      detail: 'disabled by environment',
      purpose: check.purpose,
    };
  }

  if (!commandExists(check.command)) {
    return {
      name: check.name,
      status: allowMissingTools ? 'skipped' : 'failed',
      detail: `${check.command} not installed`,
      purpose: check.purpose,
    };
  }

  const result = spawnSync(check.command, check.args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });

  if (result.error) {
    return {
      name: check.name,
      status: 'failed',
      detail: result.error.code || 'command error',
      purpose: check.purpose,
    };
  }

  if (result.status !== 0) {
    if (result.stdout) {
      console.error(result.stdout.trim());
    }
    if (result.stderr) {
      console.error(result.stderr.trim());
    }

    return {
      name: check.name,
      status: 'failed',
      detail: `exit ${result.status}`,
      purpose: check.purpose,
    };
  }

  return {
    name: check.name,
    status: 'passed',
    purpose: check.purpose,
  };
}

function commandExists(command) {
  const result = spawnSync(command, ['--version'], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });

  return !result.error && result.status === 0;
}
