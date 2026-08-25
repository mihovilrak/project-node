import { Pool } from 'pg';
import { LoginResponse } from '../types/login';

// Authenticate a user
export const login = async (
  pool: Pool,
  login: string,
  password: string
): Promise<LoginResponse | null> => {
  const result = await pool.query(
    `SELECT * FROM authentication($1, $2)`,
    [login, password]
  );
  return result.rows[0] || null;
};

// Create a new login record
export const app_logins = async (
  pool: Pool,
  id: string
): Promise<void> => {
  await pool.query(
    `INSERT INTO app_logins (user_id)
    VALUES ($1)`,
    [id]
  );
};
