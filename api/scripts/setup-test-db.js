/**
 * Start a dedicated test Postgres in Docker and run db/init/*.sql.
 * Run from api/: yarn setup-test-db
 * Requires: Docker. No .env or existing Postgres needed.
 * Uses: container pm_test_db, port 5433, user pm_user, password pm_password, db pm_test.
 */

const path = require('path');
const fs = require('fs');
const { spawnSync, execSync } = require('child_process');

const CONTAINER = 'pm_test_db';
const IMAGE = 'postgres:18.1-alpine3.23';
const PORT = 5433;
const USER = 'pm_user';
const PASSWORD = 'pm_password';
const DB = 'pm_test';

const repoRoot = path.join(__dirname, '..', '..');
const initDir = path.join(repoRoot, 'db', 'init');

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.status !== 0) process.exit(r.status === null ? 1 : r.status);
  return r;
}

function runQuiet(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf8' });
  return r.status === 0;
}

function docker(args, opts = {}) {
  return run('docker', args, opts);
}

function main() {
  console.log('Setting up integration test DB (Docker)...');

  if (!runQuiet('docker', ['info'])) {
    console.error('Docker is not running or not in PATH. Start Docker and try again.');
    process.exit(1);
  }

  const inspect = spawnSync('docker', ['inspect', '-f', '{{.State.Running}}', CONTAINER], {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  const running = inspect.status === 0 && inspect.stdout.trim() === 'true';

  if (!running) {
    const exists = spawnSync('docker', ['inspect', CONTAINER], { stdio: 'pipe' });
    if (exists.status === 0) {
      console.log('Starting existing container %s...', CONTAINER);
      docker(['start', CONTAINER]);
    } else {
      console.log('Creating container %s (port %d)...', CONTAINER, PORT);
      docker([
        'run', '-d', '--name', CONTAINER,
        '-e', 'POSTGRES_DB=' + DB,
        '-e', 'POSTGRES_USER=' + USER,
        '-e', 'POSTGRES_PASSWORD=' + PASSWORD,
        '-p', PORT + ':5432',
        IMAGE,
      ]);
    }
  } else {
    console.log('Container %s already running.', CONTAINER);
  }

  console.log('Waiting for Postgres...');
  for (let i = 0; i < 30; i++) {
    const ok = runQuiet('docker', [
      'exec', CONTAINER, 'pg_isready', '-U', USER, '-d', DB,
    ]);
    if (ok) break;
    if (i === 29) {
      console.error('Postgres did not become ready in time.');
      process.exit(1);
    }
    const until = Date.now() + 1000;
    while (Date.now() < until) {
      /* 1s busy wait for Postgres */
    }
  }

  let files;
  try {
    files = fs.readdirSync(initDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();
  } catch (err) {
    console.error('Cannot read db/init:', initDir, err.message);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log('No .sql files in db/init');
    printNext();
    return;
  }

  console.log('Running %d init scripts...', files.length);
  for (const file of files) {
    const filePath = path.join(initDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    const proc = spawnSync(
      'docker',
      ['exec', '-i', CONTAINER, 'psql', '-U', USER, '-d', DB, '-v', 'ON_ERROR_STOP=1'],
      { input: sql, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    if (proc.status !== 0) {
      console.error('%s failed:', file);
      if (proc.stderr) process.stderr.write(proc.stderr);
      process.exit(1);
    }
    console.log('  %s', file);
  }

  console.log('Done.');
  printNext();
}

function printNext() {
  console.log('');
  console.log('Run integration tests from api/ with:');
  console.log('');
  console.log('  Windows (cmd):');
  console.log('    set TEST_DB_HOST=localhost& set TEST_DB_PORT=%d& set TEST_DB_PASSWORD=%s& set SESSION_SECRET=test& yarn test:integration', PORT, PASSWORD);
  console.log('');
  console.log('  Windows (PowerShell):');
  console.log('    $env:TEST_DB_HOST="localhost"; $env:TEST_DB_PORT="%d"; $env:TEST_DB_PASSWORD="%s"; $env:SESSION_SECRET="test"; yarn test:integration', PORT, PASSWORD);
  console.log('');
  console.log('  Linux / macOS / Git Bash:');
  console.log('    TEST_DB_HOST=localhost TEST_DB_PORT=%d TEST_DB_PASSWORD=%s SESSION_SECRET=test yarn test:integration', PORT, PASSWORD);
}

main();
