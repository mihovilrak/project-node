import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as userModel from '../models/userModel';
import * as permissionModel from '../models/permissionModel';
import { CustomRequest } from '../types/express';

// Get users
export const getUsers = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const whereParams = typeof req.query.whereParams === 'string' 
      ? JSON.parse(req.query.whereParams) 
      : undefined;
    const users = await userModel.getUsers(pool, { whereParams });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID
export const getUserById = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  const { id } = req.params;
  try {
    const user = await userModel.getUserById(pool, id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a user
export const createUser = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  const {
    login,
    name,
    surname,
    email,
    password,
    role_id
  } = req.body;
  try {
    const user = await userModel.createUser(
      pool,
      login,
      name,
      surname,
      email,
      password,
      role_id
    );
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a user
export const updateUser = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  const { id } = req.params;
  const { updates } = req.body;
  try {
    const user = await userModel.updateUser(pool, updates, id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change user status
export const changeUserStatus = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const user = await userModel.changeUserStatus(pool, id, status);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a user
export const deleteUser = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  const { id } = req.params;
  try {
    const user = await userModel.deleteUser(pool, id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user permissions
export const getUserPermissions = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const permissions = await permissionModel.getUserPermissions(pool, userId);
    res.json(permissions);
  } catch (error) {
    console.error('Failed to fetch permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
