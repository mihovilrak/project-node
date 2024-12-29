import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as loginModel from '../models/loginModel';
import { LoginInput } from '../types/login';

// Login controller
export const login = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  console.log('Login attempt started');
  const { login, password } = req.body as LoginInput;

  try {
    console.log('Authenticating user:', login);
    // Check if the credentials are correct
    const user = await loginModel.login(
      pool,
      login,
      password
    );

    if (!user) {
      console.error('Invalid username or password for user:', login);
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    console.log('User authenticated successfully:', login);

    // Set session cookie if credentials are correct
    req.session.user = {
      id: user.id,
      login: user.login,
      role_id: user.role_id,
    };

    // Log login to table app_logins
    await loginModel.app_logins(pool, user.id);
    console.log('Login logged to app_logins for user:', login);

    // Put cookie on HTTP response
    res.status(200).json({
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
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
