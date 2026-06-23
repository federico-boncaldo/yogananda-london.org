import { spawnSync } from 'node:child_process';

const npmAuditArgs = ['audit', `--audit-level=${process.env.QA_NPM_AUDIT_LEVEL || 'high'}`];

if (process.env.QA_NPM_AUDIT_OMIT) {
  npmAuditArgs.push(`--omit=${process.env.QA_NPM_AUDIT_OMIT}`);
}

const checks = [
  {
    name: 'npm dependency audit',
    command: 'npm',
    args: npmAuditArgs,
  },
  {
    name: 'Composer dependency audit',
    command: 'composer',
    args: ['audit', '--locked'],
  },
];

if (process.env.QA_OSV_SCANNER === '1') {
  checks.push({
    name: 'OSV scanner',
    command: 'osv-scanner',
    args: ['scan', 'source', '--recursive', '.'],
    optional: true,
  });
}

const results = checks.map(runCheck);
const failed = results.filter((result) => result.status === 'failed');

console.log('Security vulnerability audit');
for (const result of results) {
  console.log(
    `- ${result.status.toUpperCase()}: ${result.name}${result.detail ? ` (${result.detail})` : ''}`,
  );
}

if (failed.length > 0) {
  process.exitCode = 1;
}

function runCheck(check) {
  const result = spawnSync(check.command, check.args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });

  if (result.error?.code === 'ENOENT' && check.optional) {
    return {
      name: check.name,
      status: 'skipped',
      detail: `${check.command} not installed`,
    };
  }

  if (result.error) {
    console.error(result.error.message);

    return {
      name: check.name,
      status: 'failed',
      detail: result.error.code || 'command error',
    };
  }

  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);

    return {
      name: check.name,
      status: 'failed',
      detail: `exit ${result.status}`,
    };
  }

  return {
    name: check.name,
    status: 'passed',
  };
}
