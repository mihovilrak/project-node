import { Request, Response, CookieOptions } from 'express';
import { Pool } from 'pg';
import * as loginModel from '../models/loginModel';
import * as permissionModel from '../models/permissionModel';
import { LoginInput } from '../types/login';

const MAX_LOGIN_LENGTH = 255;
const MAX_PASSWORD_LENGTH = 1024;

/**
 * Authenticate a user, verify credentials against the database, establish a session, and return user permissions.
 *
 * Validates that login and password are non-empty strings and do not exceed maximum length constraints. Authenticates credentials via the database, records the login event, regenerates the session ID to prevent session fixation attacks, and persists the session before responding. Returns a 400 status for validation errors, 401 for invalid credentials, 500 for session failures, and 200 with user data and permissions on success.
 * @param req Express request object containing credentials in the body
 * @param res Express response object for sending authentication results
 * @param pool Database connection pool for credential verification and session operations
 */
export const login = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const { login: loginName, password } = (req.body || {}) as LoginInput;

  if (typeof loginName !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'login and password must be non-empty strings',
    });
  }
  const trimmedLogin = loginName.trim();
  const trimmedPassword = password;
  if (!trimmedLogin || !trimmedPassword) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'login and password are required',
    });
  }
  if (
    trimmedLogin.length > MAX_LOGIN_LENGTH ||
    trimmedPassword.length > MAX_PASSWORD_LENGTH
  ) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'login or password exceeds maximum length',
    });
  }

  // Check if the credentials are correct
  const user = await loginModel.login(pool, trimmedLogin, trimmedPassword);

  if (!user) {
    return res.status(401).json({
      error: 'Invalid username or password',
    });
  }

  // Log login to table app_logins
  await loginModel.app_logins(pool, user.id);

  const permissions = await permissionModel.getUserPermissions(
    pool,
    String(user.id),
  );

  // Issue a brand new session id now that the user is authenticated, so a session
  // value planted before login (session fixation) cannot be reused afterwards.
  req.session.regenerate((regenerateErr) => {
    if (regenerateErr) {
      return res.status(500).json({
        error: 'Session error',
        message: 'Failed to establish session',
      });
    }

    req.session.user = {
      id: user.id,
      login: user.login,
      role_id: user.role_id,
    };

    // Save session to store before sending response so the next request finds the session
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({
          error: 'Session error',
          message: 'Failed to save session',
        });
      }
      res.status(200).json({
        message: 'Login successful',
        user: req.session.user,
        permissions,
      });
    });
  });
};

/**
 * Destroy the user session and clear the session cookie.
 *
 * Captures cookie attributes before session destruction to ensure proper cookie removal, as clearCookie requires matching path, sameSite, secure, and httpOnly values. Returns a 500 error if session destruction fails, or a 200 success response with the cookie cleared.
 * @param req Express request object containing the session to destroy
 * @param res Express response object used to send the logout result and clear the session cookie
 */
export const logout = (req: Request, res: Response): void => {
  // Capture the cookie attributes before the session is destroyed: clearCookie only
  // removes a cookie when path/sameSite/secure/httpOnly match the ones it was set with.
  const { path, sameSite, secure, httpOnly } = req.session?.cookie ?? {};
  const cookieOptions: CookieOptions = {
    path: path || '/',
    sameSite,
    // sessionMiddleware always sets a boolean; 'auto' only exists in the type.
    secure: secure as boolean | undefined,
    httpOnly,
  };

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Failed to logout',
      });
    }

    // Clear cookie
    res.clearCookie('connect.sid', cookieOptions);
    return res.status(200).json({
      message: 'Logged out successfully',
    });
  });
};
