const fs = require('fs');
const { Pool } = require('pg');
const pino = require('pino');

const createLogger = (env = process.env) =>
  pino({
    level: env.LOG_LEVEL || 'info',
    redact: {
      paths: [
        'password',
        '*.password',
        '*.pass',
        'auth.pass',
        '*.auth.pass',
        'config.email.auth.pass',
        'EMAIL_PASSWORD',
        '*.EMAIL_PASSWORD',
        'POSTGRES_PASSWORD',
        '*.POSTGRES_PASSWORD',
        'APP_DB_PASSWORD',
        '*.APP_DB_PASSWORD',
        'ADMIN_PASSWORD',
        '*.ADMIN_PASSWORD',
        'SESSION_SECRET',
        '*.SESSION_SECRET',
      ],
      censor: '[redacted]',
    },
  });

// Levels an admin may store in app_settings.log_level (mirrors its check
// constraint).
const LOG_LEVELS = Object.freeze(['error', 'warn', 'info', 'debug']);

/**
 * Switch a running logger to `level`. Anything outside LOG_LEVELS (including
 * null, for a missing settings row) leaves the current level in place.
 *
 * @param {import('pino').Logger} logger
 * @param {unknown} level
 * @returns {boolean} Whether the level changed
 */
const applyLogLevel = (logger, level) => {
  if (!LOG_LEVELS.includes(level) || logger.level === level) return false;
  const from = logger.level;
  logger.level = level;
  logger.info({ from, to: level }, 'Log level changed');
  return true;
};

/**
 * Resolve a secret from `<name>_FILE` (Docker secrets) or from `<name>` itself;
 * setting both throws. Trailing newlines are stripped the same way the postgres
 * image's entrypoint does, so both sides agree on the password.
 *
 * @param {NodeJS.ProcessEnv} env
 * @param {string} name
 * @returns {string | undefined}
 */
const readSecret = (env, name) => {
  const file = env[`${name}_FILE`];
  if (!file) return env[name];
  if (env[name]) {
    throw new Error(`Both ${name} and ${name}_FILE are set; use only one`);
  }
  try {
    return fs.readFileSync(file, 'utf8').replace(/\n+$/, '');
  } catch (err) {
    throw new Error(`Cannot read ${name}_FILE (${file}): ${err.message}`);
  }
};

const readDatabaseConfig = (env = process.env, options = {}) => {
  const test = options.preferTest && env.TEST_DB_HOST;
  const value = (postgresName, testName, fallback) => {
    const testValue = test ? env[`TEST_DB_${testName}`] : undefined;
    return testValue || env[`POSTGRES_${postgresName}`] || fallback;
  };
  const testPassword = test ? env.TEST_DB_PASSWORD : undefined;

  return {
    host: value('HOST', 'HOST', options.host),
    port: Number(value('PORT', 'PORT', options.port || 5432)),
    user: value('USER', 'USER', options.user),
    password:
      testPassword || readSecret(env, 'POSTGRES_PASSWORD') || options.password,
    database: value('DB', 'NAME', options.database),
  };
};

const DB_SETTING_NAMES = {
  host: 'POSTGRES_HOST',
  user: 'POSTGRES_USER',
  password: 'POSTGRES_PASSWORD',
  database: 'POSTGRES_DB',
};

/**
 * Throw if a resolved database config is incomplete or has an invalid port.
 *
 * @param {import('./index').DatabaseConfig} database
 */
const validateDatabaseConfig = (database) => {
  const missing = Object.keys(DB_SETTING_NAMES)
    .filter((key) => !database[key])
    .map((key) => DB_SETTING_NAMES[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required database settings: ${missing.join(', ')}`,
    );
  }
  if (!Number.isInteger(database.port) || database.port <= 0) {
    throw new Error('POSTGRES_PORT must be a valid port');
  }
};

const DEFAULT_EMAIL_PORT = 587;

/**
 * Build the SMTP transport settings. Host, port and sender come from
 * app_settings (editable at runtime); credentials are secrets and come from
 * the environment.
 *
 * @param {import('./index').EmailSettings | null} settings
 * @param {NodeJS.ProcessEnv} [env]
 */
const buildEmailConfig = (settings, env = process.env) => ({
  host: settings?.email_host || 'smtp.gmail.com',
  port: settings?.email_port || DEFAULT_EMAIL_PORT,
  secure: settings?.email_secure ?? false,
  auth: {
    user: env.EMAIL_USER,
    pass: readSecret(env, 'EMAIL_PASSWORD'),
  },
  from: settings?.sender_email || 'no-reply@example.com',
});

const createPool = (database, logger, overrides = {}) => {
  const pool = new Pool({
    ...database,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ...overrides,
  });
  pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected error on idle client');
  });
  return pool;
};

module.exports = {
  LOG_LEVELS,
  applyLogLevel,
  buildEmailConfig,
  createLogger,
  createPool,
  readDatabaseConfig,
  readSecret,
  validateDatabaseConfig,
};
