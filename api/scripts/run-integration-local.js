/**
 * Load .env.test and run integration tests. No env vars in package.json.
 * Run from api/: yarn test:integration:local
 * Copy .env.test.example to .env.test and set TEST_DB_* (and SESSION_SECRET) there.
 */

const path = require('path');
const { spawnSync } = require('child_process');

const apiRoot = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(apiRoot, '.env.test') });

if (!process.env.TEST_DB_PASSWORD || !process.env.TEST_DB_HOST) {
  console.error('Missing .env.test? Copy .env.test.example to .env.test and set TEST_DB_* and SESSION_SECRET.');
  process.exit(1);
}

const jestPath = path.join(apiRoot, 'node_modules', 'jest', 'bin', 'jest.js');
const result = spawnSync(
  process.execPath,
  [jestPath, '--config', 'src/__tests__/integration/jest.integration.config.ts', '--forceExit'],
  { stdio: 'inherit', env: process.env, cwd: apiRoot }
);
process.exit(result.status === null ? 1 : result.status);
