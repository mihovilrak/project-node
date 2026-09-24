import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as userModel from '../models/userModel';
import * as permissionModel from '../models/permissionModel';
import { deleteUserSessions } from '../models/sessionModel';
import { CustomRequest } from '../types/express';
import { UserStatusId } from '../constants/statusIds';
import { validatePassword } from '../utils/passwordPolicy';
import { parsePositiveInteger } from '../utils/requestParsing';
import { sessionUserId } from '../utils/sessionUser';

/**
 * Retrieve users with optional filtering by status and deletion state.
 *
 * By default returns only active users. Pass all=1 or all=true to include inactive and deleted users. Accepts whereParams query parameter as JSON string for custom filtering. Returns 400 when whereParams is not a JSON object.
 * @param req Express request containing optional query parameters: all (boolean flag) and whereParams (JSON-encoded filter object)
 * @param res Express response object
 * @param pool Database connection pool
 */
export const getUsers = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const all = req.query.all === '1' || req.query.all === 'true';
  let whereParams: Record<string, unknown> | undefined;
  if (typeof req.query.whereParams === 'string') {
    try {
      whereParams = JSON.parse(req.query.whereParams);
    } catch {
      whereParams = undefined;
    }
    if (
      !whereParams ||
      typeof whereParams !== 'object' ||
      Array.isArray(whereParams)
    ) {
      return res.status(400).json({ error: 'Invalid whereParams' });
    }
  }
  if (!all && (!whereParams || Object.keys(whereParams).length === 0)) {
    whereParams = { status_id: UserStatusId.Active };
  }
  const users = await userModel.getUsers(pool, {
    whereParams: (whereParams || {}) as Record<string, string>,
    includeDeleted: all,
  });
  res.status(200).json(users);
};

/**
 * Lists active users for pickers. Available to every authenticated user.
 *
 * @param _req - Express request.
 * @param res - Express response with `[{ id, login, name, surname }]`.
 * @param pool - Database connection pool.
 */
export const getUserOptions = async (
  _req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const users = await userModel.getUserOptions(pool);
  res.status(200).json(users);
};

/**
 * Retrieve a single user by their identifier from the database.
 *
 * Returns a 404 response if the user does not exist.
 * @param req Express request object containing the user ID in route parameters
 * @param res Express response object for sending the retrieved user data or error messages
 * @param pool Database connection pool for executing queries
 */
export const getUserById = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const id = parsePositiveInteger(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  const user = await userModel.getUserById(pool, String(id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(user);
};

const MAX_USER_STRING_LENGTH = 255;

/**
 * Accept and validate user data, then persist a new user record to the database.
 *
 * Requires login, name, surname, email, password, and role_id in the request body. Validates that login, name, surname, and email are non-empty strings not exceeding maximum length; password satisfies the password policy; and role_id is a positive integer. Returns the created user with status 201 on success, or a 400 error response if validation fails.
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
  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({
      error: 'Invalid request',
      message: passwordError,
    });
  }
  const roleIdNum = parsePositiveInteger(role_id);
  if (roleIdNum === null) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'role_id must be a positive integer',
    });
  }
  if (
    login.trim().length > MAX_USER_STRING_LENGTH ||
    name.trim().length > MAX_USER_STRING_LENGTH ||
    surname.trim().length > MAX_USER_STRING_LENGTH ||
    email.trim().length > MAX_USER_STRING_LENGTH
  ) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'One or more fields exceed maximum length',
    });
  }

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
};

const UPDATABLE_USER_KEYS = [
  'login',
  'name',
  'surname',
  'email',
  'password',
  'role_id',
  'status_id',
];
const SELF_PROTECTED_KEYS = ['role_id', 'status_id'];

/**
 * Update user fields by ID from the request URL, filtering updates to allowed keys and preventing self-modification of role and status.
 *
 * Accepts an update payload in the request body containing any of: login, name, surname, email, password, role_id, status_id. Users cannot modify their own role_id or status_id. A new password must satisfy the password policy and signs the user out everywhere else, as does leaving the active status. Returns the updated user record on success or a 404 error if the user is not found.
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
  const isSelfUpdate = String(req.session?.user?.id) === String(id);
  const updates = Object.keys(body)
    .filter((key) => UPDATABLE_USER_KEYS.includes(key))
    .filter((key) => !(isSelfUpdate && SELF_PROTECTED_KEYS.includes(key)))
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = body[key];
      return acc;
    }, {});

  if (updates.password !== undefined) {
    const passwordError = validatePassword(updates.password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }
  }

  const user = await userModel.updateUser(pool, updates, id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (
    updates.password !== undefined ||
    (updates.status_id !== undefined &&
      Number(user.status_id) !== UserStatusId.Active)
  ) {
    await deleteUserSessions(
      pool,
      id,
      isSelfUpdate ? req.sessionID : undefined,
    );
  }
  res.status(200).json(user);
};

/**
 * Update a user's status in the database.
 *
 * Any status other than active signs the user out. Administrators cannot change their own status. Returns the updated user object on success, 400 for an invalid status or a self-change, and 404 if the user is not found.
 * @param req HTTP request containing the user ID in params and the new status in the request body
 * @param res HTTP response object for sending the result
 * @param pool Database connection pool for executing the status update query
 */
export const changeUserStatus = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const { id } = req.params;
  const status = parsePositiveInteger(req.body?.status);
  if (status === null) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  if (String(req.session?.user?.id) === String(id)) {
    return res.status(400).json({ error: 'You cannot change your own status' });
  }
  const user = await userModel.changeUserStatus(pool, id, status);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (status !== UserStatusId.Active) {
    await deleteUserSessions(pool, id);
  }
  res.status(200).json(user);
};

/**
 * Soft-delete a user and end their sessions. Administrators cannot delete themselves.
 * @param req HTTP request containing the user ID in path parameters
 * @param res HTTP response object for sending the result
 * @param pool database connection pool for executing the delete operation
 */
export const deleteUser = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const { id } = req.params;
  if (String(req.session?.user?.id) === String(id)) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  const user = await userModel.deleteUser(pool, id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  await deleteUserSessions(pool, id);
  res.status(200).json({ message: 'User deleted' });
};

// Get user statuses
export const getUserStatuses = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const statuses = await userModel.getUserStatuses(pool);
  res.status(200).json(statuses);
};

/**
 * Retrieve the permission set for the authenticated user from the database.
 *
 * @param req The custom request object containing session data with authenticated user information.
 * @param res The response object used to send the permission list or error responses.
 * @param pool The database connection pool for executing permission queries.
 */
export const getUserPermissions = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const permissions = await permissionModel.getUserPermissions(
    pool,
    sessionUserId(req),
  );
  res.json(permissions);
};
