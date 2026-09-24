import { Pool, QueryResult } from 'pg';
import {
  User,
  UserQueryFilters,
  UserUpdateInput,
  UserStatus,
} from '../types/user';
import { invalidatePermissionCache } from './permissionModel';

/**
 * Retrieve all available user statuses ordered by identifier.
 *
 * Returns user statuses including their identifiers, display names, and optional color values from the database.
 * @param pool Database connection pool used to execute the query.
 * @returns Promise resolving to an array of UserStatus objects.
 */
export const getUserStatuses = async (pool: Pool): Promise<UserStatus[]> => {
  const result: QueryResult<UserStatus> = await pool.query(
    'SELECT id, name, color FROM user_statuses ORDER BY id',
  );
  return result.rows;
};

const ALLOWED_USER_WHERE_KEYS = ['status_id', 'role_id'] as const;

/**
 * Retrieve users from the database with optional filtering by status, role, and deletion state.
 *
 * Accepts optional filter parameters to constrain results by status_id and role_id. The includeDeleted flag controls whether soft-deleted users are included in the result set. Only whitelisted filter keys are processed for security.
 * @param pool Database connection pool
 * @param filters Query filter options including status_id, role_id, and includeDeleted flag
 */
export const getUsers = async (
  pool: Pool,
  filters?: UserQueryFilters,
): Promise<User[]> => {
  let status_id: number | null = null;
  let role_id: number | null = null;
  const includeDeleted = Boolean(filters?.includeDeleted);

  if (filters?.whereParams && Object.keys(filters.whereParams).length > 0) {
    const allowedEntries = Object.entries(filters.whereParams).filter(([key]) =>
      ALLOWED_USER_WHERE_KEYS.includes(
        key as (typeof ALLOWED_USER_WHERE_KEYS)[number],
      ),
    );
    for (const [key, value] of allowedEntries) {
      if (key === 'status_id') status_id = Number(value);
      if (key === 'role_id') role_id = Number(value);
    }
  }

  const result = await pool.query('SELECT * FROM get_users($1, $2, $3)', [
    status_id,
    role_id,
    includeDeleted,
  ]);
  return result.rows;
};

// Get a user by ID
export const getUserById = async (
  pool: Pool,
  id: string,
): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM get_users(p_id => $1)', [id]);
  return result.rows[0] || null;
};

/**
 * Insert a new user record with encrypted password and return the created user.
 *
 * The password is encrypted using bcrypt with a cost factor of 12 before storage. Returns a User object with all fields including system-generated id, timestamps, and status_id.
 * @param pool Database connection pool.
 * @param login Unique login identifier for the user.
 * @param name User's first name.
 * @param surname User's last name.
 * @param email User's email address.
 * @param password User's plaintext password, encrypted before storage.
 * @param role_id Numeric role identifier to assign to the user.
 */
export const createUser = async (
  pool: Pool,
  login: string,
  name: string,
  surname: string,
  email: string,
  password: string,
  role_id: number,
): Promise<User> => {
  const result = await pool.query(
    `INSERT INTO users
    (login, name, surname, email, password, role_id)
    VALUES ($1, $2, $3, $4, crypt($5, gen_salt('bf', 12)), $6)
    RETURNING id, login, name, surname, email, status_id, role_id, created_on, updated_on`,
    [login, name, surname, email, password, role_id],
  );
  return result.rows[0];
};

/**
 * Modify specified user fields and return the updated user record.
 *
 * Passwords are hashed with bcrypt before storage. Updates to role_id or status_id clear the user's permission cache. Returns null if the user does not exist; returns the current user record if no valid updateable fields are provided.
 * @param pool Database connection pool.
 * @param updates Object containing user fields to update: login, name, surname, email, password, role_id, or status_id.
 * @param id User ID to update.
 */
export const updateUser = async (
  pool: Pool,
  updates: UserUpdateInput | Record<string, unknown>,
  id: string,
): Promise<User | null> => {
  const columns = Object.keys(updates).filter((k) =>
    [
      'login',
      'name',
      'surname',
      'email',
      'password',
      'role_id',
      'status_id',
    ].includes(k),
  ) as Array<keyof UserUpdateInput>;
  if (columns.length === 0) {
    return getUserById(pool, id);
  }
  const values: unknown[] = [];
  const setExpressions = columns.map((column, index) => {
    if (column === 'password') {
      values.push((updates as UserUpdateInput)[column]);
      return `password = crypt($${index + 1}, gen_salt('bf', 12))`;
    } else {
      values.push((updates as UserUpdateInput)[column]);
      return `${column} = $${index + 1}`;
    }
  });

  const query = `UPDATE users SET ${setExpressions.join(', ')} WHERE id = $${columns.length + 1}`;

  values.push(id);

  const result = await pool.query(query, values);

  if (result.rowCount && result.rowCount > 0) {
    if (columns.includes('role_id') || columns.includes('status_id')) {
      invalidatePermissionCache(pool, id);
    }
    return getUserById(pool, id);
  }
  return null;
};

/**
 * Update a user's status and invalidate their cached permissions.
 *
 * Sets the user's status_id and updates the updated_on timestamp. Clears the permission cache for the affected user. Returns the updated user object or null if the user does not exist.
 * @param pool Database connection pool
 * @param id User identifier
 * @param status Numeric status identifier to assign
 */
export const changeUserStatus = async (
  pool: Pool,
  id: string,
  status: number,
): Promise<User | null> => {
  const result = await pool.query(
    `UPDATE users
    SET (status_id, updated_on) = ($1, CURRENT_TIMESTAMP)
    WHERE id = $2
    RETURNING id, login, name, surname, email, status_id, role_id, created_on, updated_on`,
    [status, id],
  );
  if (result.rows[0]) invalidatePermissionCache(pool, id);
  return result.rows[0] || null;
};

/**
 * Mark a user as deleted and invalidate their cached permissions.
 *
 * Soft-deletes a user by setting their status to 'deleted' and updating the timestamp. Returns the deleted user record or null if not found.
 * @param pool Database connection pool
 * @param id User identifier
 */
export const deleteUser = async (
  pool: Pool,
  id: string,
): Promise<User | null> => {
  const result = await pool.query(
    `UPDATE users
    SET (status_id, updated_on) = (user_status_id('deleted'), CURRENT_TIMESTAMP)
    WHERE id = $1
    RETURNING id, login, name, surname, email, status_id, role_id, created_on, updated_on`,
    [id],
  );
  if (result.rows[0]) invalidatePermissionCache(pool, id);
  return result.rows[0] || null;
};
