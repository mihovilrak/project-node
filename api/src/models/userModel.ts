import { Pool } from 'pg';
import {
  User,
  UserQueryFilters,
  UserUpdateInput,
} from '../types/user';

// Get all users
export const getUsers = async (
  pool: Pool,
  filters?: UserQueryFilters
): Promise<User[]> => {
  let query = 'SELECT * FROM v_users';
  let values: any[] = [];

  if (filters?.whereParams && Object.keys(filters.whereParams).length > 0) {
    query += ' WHERE ';
    const conditions: string[] = [];

    Object.keys(filters.whereParams).forEach((param, index) => {
      conditions.push(`${param} = $${index + 1}`);
      values.push(filters.whereParams[param]);
    });

    query += conditions.join(' AND ');
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
  updates: UserUpdateInput,
  id: string
): Promise<number | null> => {
  const columns = Object.keys(updates) as Array<keyof UserUpdateInput>;
  const values: any[] = [];

  let setExpressions = columns.map((column, index) => {
    if (column === 'password') {
      values.push(updates[column]);
      return `password = crypt($${index + 1}, gen_salt('bf', 12))`;
    } else {
      values.push(updates[column]);
      return `$${index + 1}`;
    }
  });
  
  let query = `UPDATE users SET (${columns.join(', ')}) = 
    (${setExpressions.join(', ')}) WHERE id = $${columns.length + 1}`;
  
  values.push(id);
  
  const result = await pool.query(query, values);

  return result.rowCount;
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
