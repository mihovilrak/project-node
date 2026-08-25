jest.unmock('../logger');
import { sanitizeForLog } from '../logger';

describe('logger sanitizeForLog', () => {
  it('redacts password key in objects', () => {
    const input = { user: 'john', password: 'secret123' };
    const result = sanitizeForLog(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.user).toBe('john');
  });

  it('redacts token and authorization keys', () => {
    const input = { token: 'abc', authorization: 'Bearer xyz' };
    const result = sanitizeForLog(input) as Record<string, unknown>;
    expect(result.token).toBe('[REDACTED]');
    expect(result.authorization).toBe('[REDACTED]');
  });

  it('returns non-objects as-is', () => {
    expect(sanitizeForLog('hello')).toBe('hello');
    expect(sanitizeForLog(42)).toBe(42);
    expect(sanitizeForLog(null)).toBe(null);
  });
});
