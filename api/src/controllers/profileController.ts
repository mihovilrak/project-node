import { Response } from 'express';
import { Pool } from 'pg';
import * as profileModel from '../models/profileModel';
import { deleteUserSessions } from '../models/sessionModel';
import { CustomRequest } from '../types/express';
import { ProfileUpdateInput, PasswordUpdateInput } from '../types/profile';
import { validatePassword } from '../utils/passwordPolicy';
import { sessionUserId } from '../utils/sessionUser';

/**
 * Retrieve the authenticated user's profile information.
 *
 * Extracts the user ID from the session and fetches the corresponding profile
 * data.
 *
 * @param req The HTTP request object containing the user's session data.
 * @param res The HTTP response object used to send the profile data or error.
 * @param pool The database connection pool used to query profile information.
 */
export const getProfile = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const profile = await profileModel.getProfile(pool, sessionUserId(req));
  res.status(200).json(profile);
};

/**
 * Update the authenticated user's profile with new email, name, or surname
 * information.
 *
 * Only the fields present in the payload are changed.
 *
 * @param req Express request object containing session user data and profile
 *   update payload
 * @param res Express response object for sending HTTP responses
 * @param pool Database connection pool for executing profile update queries
 */
export const updateProfile = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const profile = await profileModel.updateProfile(
    pool,
    sessionUserId(req),
    (req.body ?? {}) as ProfileUpdateInput,
  );
  res.status(200).json(profile);
};

/**
 * Update the authenticated user's password after validating the current
 * password and policy requirements.
 *
 * Verifies the current password, validates the new password against security
 * policy, ensures the new password differs from the current one, and
 * invalidates all other active sessions for the user upon successful update.
 *
 * @param req Express request with authenticated user session and password
 *   update payload
 * @param res Express response object for sending success or error status
 * @param pool Database connection pool for credential and session operations
 */
export const changePassword = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const userId = sessionUserId(req);
  const body = (req.body ?? {}) as PasswordUpdateInput;
  // Frontend sends current_password; accept both for compatibility
  const currentPassword = body.current_password ?? body.old_password;
  const new_password = body.new_password;

  if (!currentPassword || !new_password) {
    return res.status(400).json({
      error: 'Current password and new password are required',
    });
  }

  const policyError = validatePassword(new_password);
  if (policyError) {
    return res.status(400).json({ error: policyError });
  }

  if (new_password === currentPassword) {
    return res.status(400).json({
      error: 'New password must differ from the current password',
    });
  }

  const verified = await profileModel.verifyPassword(
    pool,
    userId,
    currentPassword,
  );
  if (!verified) {
    return res.status(400).json({
      error: 'Current password is incorrect',
    });
  }

  const updatedUser = await profileModel.changePassword(
    pool,
    userId,
    new_password,
  );
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  await deleteUserSessions(pool, userId, req.sessionID);

  res.status(200).json({
    message: `Password updated successfully on ${updatedUser.updated_on}`,
  });
};

/**
 * Retrieve the authenticated user's recent tasks from the database.
 *
 * @param req Express request object with session data containing the
 *   authenticated user's ID
 * @param res Express response object for sending JSON data and status codes
 * @param pool Database connection pool for querying recent tasks
 */
export const getRecentTasks = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const tasks = await profileModel.getRecentTasks(pool, sessionUserId(req));
  res.status(200).json(tasks);
};

/**
 * Retrieve projects associated with the authenticated user sorted by recency.
 *
 * @param req Express request object with optional session containing user
 *   information
 * @param res Express response object for sending the HTTP response
 * @param pool Database connection pool for querying project data
 */
export const getRecentProjects = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const projects = await profileModel.getRecentProjects(
    pool,
    sessionUserId(req),
  );
  res.status(200).json(projects);
};
