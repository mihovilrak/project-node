import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as loginModel from '../models/loginModel';
import { LoginInput } from '../types/login';

// Login controller
export const login = async (req: Request, res: Response, pool: Pool): Promise<void> => {
  const { login, password } = req.body as LoginInput;

  try {
    // Check if the credentials are correct
    const user = await loginModel.login(
      pool,
      login,
      password
    );

    if (!user) {
      console.error('Invalid username or password');
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    // Set session cookie if credentials are correct
    req.session.user = {
      id: user.id,
      login: user.login,
      role: user.role_id,
    };

    // Log login to table app_logins
    loginModel.app_logins(pool, user.id);

    // Put cookie on HTTP response
    res.status(200).json({
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
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
