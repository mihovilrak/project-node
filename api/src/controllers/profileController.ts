import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as profileModel from '../models/profileModel';
import { CustomRequest } from '../types/express';
import { ProfileUpdateInput, PasswordUpdateInput } from '../types/profile';
import logger from '../utils/logger';
import { validatePassword } from '../utils/passwordPolicy';

/**
 * Retrieve the authenticated user's profile information.
 *
 * Extracts the user ID from the session and fetches the corresponding profile data. Returns a 401 error if the user is not authenticated, or a 500 error if an internal server error occurs.
 * @param req The HTTP request object containing the user's session data.
 * @param res The HTTP response object used to send the profile data or error.
 * @param pool The database connection pool used to query profile information.
 */
export const getProfile = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    const profile = await profileModel.getProfile(pool, userId);
    res.status(200).json(profile);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Update the authenticated user's profile with new email, name, or surname information.
 *
 * Requires an active user session; returns a 401 error if the user is not authenticated. Sends a 500 error on internal server failures.
 * @param req Express request object containing session user data and profile update payload
 * @param res Express response object for sending HTTP responses
 * @param pool Database connection pool for executing profile update queries
 */
export const updateProfile = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;
    const profileData = req.body as ProfileUpdateInput;

    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    const profile = await profileModel.updateProfile(pool, userId, profileData);
    res.status(200).json(profile);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Update the authenticated user's password after validating the current password and policy requirements.
 *
 * Verifies the current password, validates the new password against security policy, ensures the new password differs from the current one, and invalidates all other active sessions for the user upon successful update.
 * @param req Express request with authenticated user session and password update payload
 * @param res Express response object for sending success or error status
 * @param pool Database connection pool for credential and session operations
 */
export const changePassword = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;
    const body = req.body as PasswordUpdateInput;
    // Frontend sends current_password; accept both for compatibility
    const currentPassword = body.current_password ?? body.old_password;
    const new_password = body.new_password;

    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

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

    // Verify current password
    const verifyResult = await profileModel.verifyPassword(
      pool,
      userId,
      currentPassword,
    );

    if (!verifyResult) {
      return res.status(400).json({
        error: 'Current password is incorrect',
      });
    }

    // Update password
    const updatedUser = await profileModel.changePassword(
      pool,
      userId,
      new_password,
    );
    if (!updatedUser) {
      return res.status(500).json({
        error: 'Failed to update password',
      });
    }

    // Every other device holding a session for this account is now stale.
    try {
      await profileModel.deleteOtherSessions(pool, userId, req.sessionID);
    } catch (error) {
      logger.error({ err: error }, 'Failed to invalidate other sessions');
    }

    res.status(200).json({
      message: `Password updated successfully on ${updatedUser.updated_on}`,
    });
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Retrieve the authenticated user's recent tasks from the database.
 *
 * Requires an authenticated session and returns a 401 error if the user is not logged in. Returns a 500 error on database or server errors.
 * @param req Express request object with session data containing the authenticated user's ID
 * @param res Express response object for sending JSON data and status codes
 * @param pool Database connection pool for querying recent tasks
 */
export const getRecentTasks = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    const tasks = await profileModel.getRecentTasks(pool, userId);
    res.status(200).json(tasks);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Retrieve projects associated with the authenticated user sorted by recency.
 *
 * Requires an authenticated session. Returns a 401 error if the user is not authenticated, a 200 response with the projects list on success, or a 500 error if an internal server error occurs.
 * @param req Express request object with optional session containing user information
 * @param res Express response object for sending the HTTP response
 * @param pool Database connection pool for querying project data
 */
export const getRecentProjects = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const projects = await profileModel.getRecentProjects(pool, userId);
    res.status(200).json(projects);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};
