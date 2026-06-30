import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const checks = [];

runPhpSyntaxChecks();
runIfAvailable('vendor/bin/pint', ['--test'], 'Laravel Pint');
runIfAvailable('vendor/bin/phpcs', [], 'PHP_CodeSniffer');
runIfAvailable('vendor/bin/phpstan', ['analyse', '--debug', '--memory-limit=1G'], 'PHPStan');

const failed = checks.filter((check) => check.status === 'failed');

console.log('Static QA checks');
for (const check of checks) {
  console.log(
    `- ${check.status.toUpperCase()}: ${check.name}${check.detail ? ` (${check.detail})` : ''}`,
  );
}

if (failed.length > 0) {
  process.exitCode = 1;
}

function runPhpSyntaxChecks() {
  const files = collectPhpFiles(['app', 'comments.php', 'functions.php', 'index.php']);
  const phpBin = process.env.QA_PHP_BIN || 'php';
  const failedFiles = [];

  for (const file of files) {
    const result = spawnSync(phpBin, ['-l', file], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });

    if (result.status !== 0) {
      failedFiles.push(`${file}: ${result.stderr || result.stdout}`.trim());
    }
  }

  checks.push({
    name: 'PHP syntax',
    status: failedFiles.length > 0 ? 'failed' : 'passed',
    detail: `${files.length} files`,
  });

  if (failedFiles.length > 0) {
    console.error(failedFiles.join('\n\n'));
  }
}

function runIfAvailable(binary, args, label) {
  if (!existsSync(binary)) {
    checks.push({
      name: label,
      status: 'skipped',
      detail: `${binary} not installed`,
    });
    return;
  }

  const result = spawnSync(binary, args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });

  checks.push({
    name: label,
    status: result.status === 0 ? 'passed' : 'failed',
  });

  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
  }
}

function collectPhpFiles(paths) {
  return paths.flatMap((path) => {
    if (!existsSync(path)) {
      return [];
    }

    if (statSync(path).isFile()) {
      return path.endsWith('.php') ? [path] : [];
    }

    return walkPhp(path);
  });
}

function walkPhp(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkPhp(path);
    }

    return entry.isFile() && entry.name.endsWith('.php') ? [path] : [];
  });
}
