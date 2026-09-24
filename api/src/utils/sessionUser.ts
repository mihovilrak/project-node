import { CustomRequest } from '../types/express';
import { CustomError } from '../types/error';

/**
 * Returns the id of the signed-in user.
 *
 * Routes behind authMiddleware always have a session user, so the 401 only guards handlers mounted without it.
 * @param req - Request carrying the session.
 * @returns The user id as a string.
 * @throws A 401 CustomError when the session has no user.
 */
export const sessionUserId = (req: CustomRequest): string => {
  const id = req.session?.user?.id;
  if (id === undefined || id === null || id === '') {
    const error: CustomError = new Error('Not authenticated');
    error.status = 401;
    throw error;
  }
  return String(id);
};
