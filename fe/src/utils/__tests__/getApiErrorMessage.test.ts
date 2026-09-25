import getApiErrorMessage, { getApiErrorStatus } from '../getApiErrorMessage';

const httpError = (status: number, data?: unknown) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    response: { status, data },
  });

describe('getApiErrorMessage', () => {
  it('prefers the server error text', () => {
    expect(getApiErrorMessage(httpError(400, { error: 'Bad input' }))).toBe(
      'Bad input',
    );
  });

  it.each([
    [403, 'You do not have permission to perform this action'],
    [404, 'The requested item was not found'],
    [409, 'This item already exists'],
  ])('maps status %i without a server message', (status, message) => {
    expect(getApiErrorMessage(httpError(status))).toBe(message);
  });

  it('falls back to the Error message', () => {
    expect(getApiErrorMessage(httpError(500))).toBe(
      'Request failed with status code 500',
    );
  });

  it('uses the fallback for non-errors', () => {
    expect(getApiErrorMessage('oops', 'Fallback')).toBe('Fallback');
    expect(getApiErrorMessage(null)).toBe('An error occurred');
  });
});

describe('getApiErrorStatus', () => {
  it('returns the HTTP status', () => {
    expect(getApiErrorStatus(httpError(404))).toBe(404);
  });

  it('returns undefined for non-HTTP errors', () => {
    expect(getApiErrorStatus(new Error('network'))).toBeUndefined();
    expect(getApiErrorStatus(undefined)).toBeUndefined();
  });
});
