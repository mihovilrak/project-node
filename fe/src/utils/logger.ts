const isProduction = process.env.NODE_ENV === 'production';

const noop = (): void => {};

/** Keys redacted in production logs: password, token, authorization, cookie, session, etc. */
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'cookie',
  'session',
  'secret',
  'apiKey',
  'api_key',
  'accessToken',
  'refreshToken',
]);

const REDACTED = '[REDACTED]';

/**
 * Sanitizes a value for logging in production: redacts sensitive object keys.
 * One level deep for objects; arrays are mapped recursively. Otherwise returns value as-is.
 * Exported for testing.
 */
export function sanitizeForLog(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeForLog);
  }
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase();
    const isSensitive = Array.from(SENSITIVE_KEYS).some(
      (sk) => lower.includes(sk) || lower === sk
    );
    out[key] = isSensitive ? REDACTED : sanitizeForLog(obj[key]);
  }
  return out;
}

function sanitizeArgs(args: unknown[]): unknown[] {
  return isProduction ? args.map(sanitizeForLog) : args;
}

const logger = {
  debug: isProduction ? noop : (...args: unknown[]) => console.debug(...args),
  info: isProduction ? noop : (...args: unknown[]) => console.info(...args),
  warn: (...args: unknown[]) => console.warn(...sanitizeArgs(args)),
  error: (...args: unknown[]) => console.error(...sanitizeArgs(args)),
};

export default logger;
