import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as userModel from '../models/userModel';
import * as permissionModel from '../models/permissionModel';
import { CustomRequest } from '../types/express';
import logger from '../utils/logger';

// Get users
export const getUsers = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    let whereParams: Record<string, unknown> | undefined =
      typeof req.query.whereParams === 'string'
        ? JSON.parse(req.query.whereParams)
        : undefined;
    // Default to active users only (status_id = 1) when no filter is supplied
    if (!whereParams || Object.keys(whereParams).length === 0) {
      whereParams = { status_id: 1 };
    }
    const users = await userModel.getUsers(pool, {
      whereParams: whereParams as Record<string, string>
    });
    res.status(200).json(users);
  } catch (error) {
    logger.error({ err: error });
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
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const MAX_USER_STRING_LENGTH = 255;
const MAX_PASSWORD_LENGTH = 1024;

// Create a user
export const createUser = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  const body = req.body ?? {};
  const { login, name, surname, email, password, role_id } = body;

  if (typeof login !== 'string' || !login.trim()) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'login is required and must be a non-empty string'
    });
  }
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'name is required and must be a non-empty string'
    });
  }
  if (typeof surname !== 'string' || !surname.trim()) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'surname is required and must be a non-empty string'
    });
  }
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'email is required and must be a non-empty string'
    });
  }
  if (typeof password !== 'string' || !password) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'password is required and must be a non-empty string'
    });
  }
  const roleIdNum = Number(role_id);
  if (!Number.isInteger(roleIdNum) || roleIdNum < 1) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'role_id must be a positive integer'
    });
  }
  if (login.trim().length > MAX_USER_STRING_LENGTH ||
      name.trim().length > MAX_USER_STRING_LENGTH ||
      surname.trim().length > MAX_USER_STRING_LENGTH ||
      email.trim().length > MAX_USER_STRING_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'One or more fields exceed maximum length'
    });
  }

  try {
    const user = await userModel.createUser(
      pool,
      login.trim(),
      name.trim(),
      surname.trim(),
      email.trim(),
      password,
      roleIdNum
    );
    res.status(201).json(user);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a user (body is the update payload directly; id comes from URL)
export const updateUser = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  const { id } = req.params;
  const body = req.body || {};
  const allowedKeys = ['login', 'name', 'surname', 'email', 'password', 'role_id', 'status_id'];
  const updates = Object.keys(body)
    .filter((key) => allowedKeys.includes(key))
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = body[key];
      return acc;
    }, {});
  try {
    const user = await userModel.updateUser(pool, updates, id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    logger.error({ err: error });
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
    logger.error({ err: error });
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
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user statuses
export const getUserStatuses = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const statuses = await userModel.getUserStatuses(pool);
    res.status(200).json(statuses);
  } catch (error) {
    logger.error({ err: error });
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
    logger.error({ err: error }, 'Failed to fetch permissions');
    res.status(500).json({ error: 'Internal server error' });
  }
};
