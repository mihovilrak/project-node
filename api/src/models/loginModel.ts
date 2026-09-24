import { Pool } from 'pg';
import { LoginResponse } from '../types/login';

/**
 * Authenticate a user by verifying credentials against the database.
 *
 * Queries the database authentication function with the provided login and password, returning user details if credentials are valid or null if authentication fails.
 * @param pool Database connection pool
 * @param login Username or login identifier
 * @param password User password
 * @returns User details including id, login, and role_id if authentication succeeds, or null if credentials are invalid
 */
export const login = async (
  pool: Pool,
  login: string,
  password: string,
): Promise<LoginResponse | null> => {
  const result = await pool.query(`SELECT * FROM authentication($1, $2)`, [
    login,
    password,
  ]);
  return result.rows[0] || null;
};

/**
 * Insert a login record for the specified user into the app_logins table.
 *
 * This function creates a new login audit entry by inserting the user ID into the database. It is typically called after a successful user authentication to track login activity.
 * @param pool Database connection pool used to execute the insert query.
 * @param id The user ID to record in the login audit table.
 */
export const app_logins = async (pool: Pool, id: string): Promise<void> => {
  await pool.query(
    `INSERT INTO app_logins (user_id)
    VALUES ($1)`,
    [id],
  );
};
