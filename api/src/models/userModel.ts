import { Pool, QueryResult } from 'pg';
import {
  User,
  UserQueryFilters,
  UserUpdateInput,
  UserStatus,
} from '../types/user';

// Get user statuses
export const getUserStatuses = async (pool: Pool): Promise<UserStatus[]> => {
  const result: QueryResult<UserStatus> = await pool.query(
    'SELECT id, name FROM user_statuses ORDER BY id'
  );
  return result.rows;
};

const ALLOWED_USER_WHERE_KEYS = ['status_id', 'role_id'] as const;

// Get all users
export const getUsers = async (
  pool: Pool,
  filters?: UserQueryFilters
): Promise<User[]> => {
  let query = 'SELECT * FROM v_users';
  const values: any[] = [];

  if (filters?.whereParams && Object.keys(filters.whereParams).length > 0) {
    const allowedEntries = Object.entries(filters.whereParams).filter(([key]) =>
      ALLOWED_USER_WHERE_KEYS.includes(key as typeof ALLOWED_USER_WHERE_KEYS[number])
    );
    if (allowedEntries.length > 0) {
      query += ' WHERE ';
      const conditions = allowedEntries.map((_, index) => `${allowedEntries[index][0]} = $${index + 1}`);
      query += conditions.join(' AND ');
      values.push(...allowedEntries.map(([, v]) => v));
    }
  }

  const result = await pool.query(query, values);
  return result.rows;
};

// Get a user by ID
export const getUserById = async (
  pool: Pool,
  id: string
): Promise<User | null> => {
  const result = await pool.query(
    'SELECT * FROM v_users WHERE id = $1',
    [id]);
  return result.rows[0] || null;
};

// Create a user
export const createUser = async (
  pool: Pool,
  login: string,
  name: string,
  surname: string,
  email: string,
  password: string,
  role_id: number
): Promise<User> => {
  const result = await pool.query(
    `INSERT INTO users
    (login, name, surname, email, password, role_id)
    VALUES ($1, $2, $3, $4, crypt($5, gen_salt('bf', 12)), $6)
    RETURNING *`,
      [login, name, surname, email, password, role_id]
  );
  return result.rows[0];
};

// Update a user
export const updateUser = async (
  pool: Pool,
  updates: UserUpdateInput | Record<string, unknown>,
  id: string
): Promise<User | null> => {
  const columns = Object.keys(updates).filter((k) =>
    ['login', 'name', 'surname', 'email', 'password', 'role_id', 'status_id'].includes(k)
  ) as Array<keyof UserUpdateInput>;
  if (columns.length === 0) {
    return getUserById(pool, id);
  }
  const values: any[] = [];
  const setExpressions = columns.map((column, index) => {
    if (column === 'password') {
      values.push((updates as UserUpdateInput)[column]);
      return `password = crypt($${index + 1}, gen_salt('bf', 12))`;
    } else {
      values.push((updates as UserUpdateInput)[column]);
      return `$${index + 1}`;
    }
  });

  const query = `UPDATE users SET (${columns.join(', ')}) =
    (${setExpressions.join(', ')}) WHERE id = $${columns.length + 1}`;

  values.push(id);

  const result = await pool.query(query, values);

  if (result.rowCount && result.rowCount > 0) {
    return getUserById(pool, id);
  }
  return null;
};

// Change user status
export const changeUserStatus = async (
  pool: Pool,
  id: string,
  status: number
): Promise<User | null> => {
  const result = await pool.query(
    `UPDATE users
    SET (status_id, updated_on) = ($1, CURRENT_TIMESTAMP)
    WHERE id = $2
    RETURNING *`,
    [status, id]
  );
  return result.rows[0] || null;
};

// Delete a user
export const deleteUser = async (
  pool: Pool,
  id: string
): Promise<User | null> => {
  const result = await pool.query(
    `UPDATE users
    SET (status_id, updated_on) = (3, CURRENT_TIMESTAMP)
    WHERE id = $1
    RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};
