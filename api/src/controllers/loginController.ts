import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as loginModel from '../models/loginModel';
import * as permissionModel from '../models/permissionModel';
import { LoginInput } from '../types/login';

const MAX_LOGIN_LENGTH = 255;
const MAX_PASSWORD_LENGTH = 1024;

// Login controller
export const login = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  const { login: loginName, password } = (req.body || {}) as LoginInput;

  if (typeof loginName !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'login and password must be non-empty strings'
    });
  }
  const trimmedLogin = loginName.trim();
  const trimmedPassword = password;
  if (!trimmedLogin || !trimmedPassword) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'login and password are required'
    });
  }
  if (trimmedLogin.length > MAX_LOGIN_LENGTH || trimmedPassword.length > MAX_PASSWORD_LENGTH) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'login or password exceeds maximum length'
    });
  }

  // Check if the credentials are correct
  const user = await loginModel.login(
    pool,
    trimmedLogin,
    trimmedPassword
  );

  if (!user) {
    return res.status(401).json({
      error: 'Invalid username or password'
    });
  }

  // Set session cookie if credentials are correct
  req.session.user = {
    id: user.id,
    login: user.login,
    role_id: user.role_id,
  };

  // Log login to table app_logins
  await loginModel.app_logins(pool, user.id);

  const permissions = await permissionModel.getUserPermissions(pool, String(user.id));

  // Put cookie on HTTP response (include permissions so frontend doesn't need a follow-up check-session)
  res.status(200).json({
    message: 'Login successful',
    user: req.session.user,
    permissions
  });
};

// Logout controller
export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Failed to logout'
      });
    }

    // Clear cookie
    res.clearCookie('connect.sid');
    return res.status(200).json({
      message: 'Logged out successfully'
    });
  });
};
