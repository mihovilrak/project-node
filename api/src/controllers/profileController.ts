import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as profileModel from '../models/profileModel';
import { CustomRequest } from '../types/express';
import { ProfileUpdateInput, PasswordUpdateInput } from '../types/profile';

// Get user profile
export const getProfile = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated'
      });
    }

    const profile = await profileModel.getProfile(pool, userId);
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Update user profile
export const updateProfile = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;
    const profileData = req.body as ProfileUpdateInput;

    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated'
      });
    }

    const profile = await profileModel.updateProfile(
      pool,
      userId,
      profileData
    );
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Change user password
export const changePassword = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;
    const { old_password, new_password } = req.body as PasswordUpdateInput;

    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated'
      });
    }

    // Verify current password
    const verifyResult = await profileModel.verifyPassword(pool, userId, old_password);

    if (!verifyResult) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    const updatedUser = await profileModel.changePassword(pool, userId, new_password);
    if (!updatedUser) {
      return res.status(500).json({
        error: 'Failed to update password'
      });
    }
    res.status(200).json({
      message: `Password updated successfully on ${updatedUser.updated_on}`,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get recent tasks
export const getRecentTasks = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated'
      });
    }

    const tasks = await profileModel.getRecentTasks(pool, userId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get recent projects
export const getRecentProjects = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const projects = await profileModel.getRecentProjects(pool, userId);
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};
