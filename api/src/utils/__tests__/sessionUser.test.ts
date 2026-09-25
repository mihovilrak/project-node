import { CustomRequest } from '../../types/express';
import { sessionUserId } from '../sessionUser';

const requestWith = (user?: unknown) =>
  ({ session: user === undefined ? {} : { user } }) as unknown as CustomRequest;

describe('sessionUserId', () => {
  it('returns the session user id as a string', () => {
    expect(sessionUserId(requestWith({ id: 7 }))).toBe('7');
  });

  it('throws 401 without a session user', () => {
    expect(() => sessionUserId(requestWith())).toThrow(
      expect.objectContaining({ status: 401 }),
    );
    expect(() => sessionUserId({} as CustomRequest)).toThrow(
      'Not authenticated',
    );
  });
});
