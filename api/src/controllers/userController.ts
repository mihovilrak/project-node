import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as userModel from '../models/userModel';
import * as permissionModel from '../models/permissionModel';
import { CustomRequest } from '../types/express';
import logger from '../utils/logger';
import { UserStatusId } from '../constants/statusIds';

/**
 * Retrieve users with optional filtering by status and deletion state.
 *
 * By default returns only active users. Pass all=1 or all=true to include inactive and deleted users. Accepts whereParams query parameter as JSON string for custom filtering. Returns 500 on error.
 * @param req Express request containing optional query parameters: all (boolean flag) and whereParams (JSON-encoded filter object)
 * @param res Express response object
 * @param pool Database connection pool
 */
export const getUsers = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const all = req.query.all === '1' || req.query.all === 'true';
    let whereParams: Record<string, unknown> | undefined =
      typeof req.query.whereParams === 'string'
        ? JSON.parse(req.query.whereParams)
        : undefined;
    if (!all && (!whereParams || Object.keys(whereParams).length === 0)) {
      whereParams = { status_id: UserStatusId.Active };
    }
    const users = await userModel.getUsers(pool, {
      whereParams: (whereParams || {}) as Record<string, string>,
      includeDeleted: all,
    });
    res.status(200).json(users);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve a single user by their identifier from the database.
 *
 * Returns a 404 response if the user does not exist. Returns a 500 response on server errors.
 * @param req Express request object containing the user ID in route parameters
 * @param res Express response object for sending the retrieved user data or error messages
 * @param pool Database connection pool for executing queries
 */
export const getUserById = async (
  req: Request,
  res: Response,
  pool: Pool,
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

/**
 * Accept and validate user data, then persist a new user record to the database.
 *
 * Requires login, name, surname, email, password, and role_id in the request body. Validates that login, name, surname, and email are non-empty strings not exceeding maximum length; password is a non-empty string not exceeding maximum length; and role_id is a positive integer. Returns the created user with status 201 on success, or a 400 error response if validation fails, or a 500 error response if database insertion fails.
 * @param req Express request object containing user data in body
 * @param res Express response object for sending the created user or error
 * @param pool Database connection pool for user persistence
 */
export const createUser = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const body = req.body ?? {};
  const { login, name, surname, email, password, role_id } = body;

  if (typeof login !== 'string' || !login.trim()) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'login is required and must be a non-empty string',
    });
  }
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'name is required and must be a non-empty string',
    });
  }
  if (typeof surname !== 'string' || !surname.trim()) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'surname is required and must be a non-empty string',
    });
  }
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'email is required and must be a non-empty string',
    });
  }
  if (typeof password !== 'string' || !password) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'password is required and must be a non-empty string',
    });
  }
  const roleIdNum = Number(role_id);
  if (!Number.isInteger(roleIdNum) || roleIdNum < 1) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'role_id must be a positive integer',
    });
  }
  if (
    login.trim().length > MAX_USER_STRING_LENGTH ||
    name.trim().length > MAX_USER_STRING_LENGTH ||
    surname.trim().length > MAX_USER_STRING_LENGTH ||
    email.trim().length > MAX_USER_STRING_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'One or more fields exceed maximum length',
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
      roleIdNum,
    );
    res.status(201).json(user);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update user fields by ID from the request URL, filtering updates to allowed keys and preventing self-modification of role and status.
 *
 * Accepts an update payload in the request body containing any of: login, name, surname, email, password, role_id, status_id. Users cannot modify their own role_id or status_id. Returns the updated user record on success or a 404 error if the user is not found.
 * @param req CustomRequest with params.id and body containing update fields
 * @param res Response object for sending the result or error
 * @param pool Database connection pool for executing the update query
 */
export const updateUser = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const { id } = req.params;
  const body = req.body || {};
  const allowedKeys = [
    'login',
    'name',
    'surname',
    'email',
    'password',
    'role_id',
    'status_id',
  ];
  const isSelfUpdate = String(req.session?.user?.id) === String(id);
  const selfProtectedKeys = ['role_id', 'status_id'];
  const updates = Object.keys(body)
    .filter((key) => allowedKeys.includes(key))
    .filter((key) => !(isSelfUpdate && selfProtectedKeys.includes(key)))
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

/**
 * Update a user's status in the database.
 *
 * Returns the updated user object on success. Returns a 404 error if the user is not found. Returns a 500 error if an internal server error occurs during the operation.
 * @param req HTTP request containing the user ID in params and the new status in the request body
 * @param res HTTP response object for sending the result
 * @param pool Database connection pool for executing the status update query
 */
export const changeUserStatus = async (
  req: Request,
  res: Response,
  pool: Pool,
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

/**
 * Remove a user by identifier from the system.
 * @param req HTTP request containing the user ID in path parameters
 * @param res HTTP response object for sending the result
 * @param pool database connection pool for executing the delete operation
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  pool: Pool,
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
  pool: Pool,
): Promise<Response | void> => {
  try {
    const statuses = await userModel.getUserStatuses(pool);
    res.status(200).json(statuses);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve the permission set for the authenticated user from the database.
 *
 * Requires an authenticated session; returns a 401 error if the user is not authenticated, and a 500 error if the database query fails.
 * @param req The custom request object containing session data with authenticated user information.
 * @param res The response object used to send the permission list or error responses.
 * @param pool The database connection pool for executing permission queries.
 */
export const getUserPermissions = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
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
