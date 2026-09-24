import { Pool } from 'pg';
import { Profile, ProfileUpdateInput } from '../types/profile';
import { Task } from '../types/task';
import { Project } from '../types/project';

// Get user profile
export const getProfile = async (
  pool: Pool,
  userId: string,
): Promise<Profile | null> => {
  const result = await pool.query('SELECT * FROM get_profile($1)', [userId]);
  return result.rows[0] || null;
};

/**
 * Update the user profile with new email, name, or surname information.
 *
 * Returns the updated profile object on success or null if the user does not exist. Updates the updated_on timestamp to the current database time.
 * @param pool Database connection pool
 * @param userId The ID of the user whose profile is being updated
 * @param profileData Object containing optional fields: name, surname, and email to update
 * @returns The updated Profile object or null if no matching user was found
 */
export const updateProfile = async (
  pool: Pool,
  userId: string,
  profileData: ProfileUpdateInput,
): Promise<Profile | null> => {
  const { email, name, surname } = profileData;

  const result = await pool.query(
    `UPDATE users
     SET (email, name, surname, updated_on)
     = ($1, $2, $3, CURRENT_TIMESTAMP)
     WHERE id = $4
     RETURNING id, login, name, surname, email, status_id, role_id, created_on, updated_on`,
    [email, name, surname, userId],
  );
  return result.rows[0] || null;
};

/**
 * Verify that a password matches the stored credential for a user by identifier.
 *
 * This function accepts a user identifier rather than a login name; callers needing to authenticate by login credentials should use authentication() instead. Password comparison uses cryptographic hashing via the database crypt function.
 * @param pool Database connection pool.
 * @param userId The user identifier to verify against.
 * @param password The plaintext password to verify.
 */
export const verifyPassword = async (
  pool: Pool,
  userId: string,
  password: string,
): Promise<boolean> => {
  const result = await pool.query(
    `SELECT EXISTS(
      SELECT 1 FROM users
      WHERE id = $1 AND password = crypt($2, password)
    )`,
    [userId, password],
  );
  return result.rows[0].exists;
};

/**
 * Update the user's password with bcrypt hashing and return the updated profile.
 *
 * The password is hashed using bcrypt with a cost factor of 12 before storage. The update timestamp is automatically set to the current time.
 * @param pool Database connection pool
 * @param userId Identifier of the user whose password to change
 * @param password New password to set
 * @returns Updated profile object or null if the user does not exist
 */
export const changePassword = async (
  pool: Pool,
  userId: string,
  password: string,
): Promise<Profile | null> => {
  const result = await pool.query(
    `UPDATE users
     SET (password, updated_on)
     = (crypt($1, gen_salt('bf', 12)), CURRENT_TIMESTAMP)
     WHERE id = $2
     RETURNING id, login, name, surname, email, status_id, role_id, created_on, updated_on`,
    [password, userId],
  );
  return result.rows[0] || null;
};

/**
 * Invalidate all sessions for a user except the current one to enforce account-wide sign-out on password change.
 *
 * When currentSid is provided, that session is preserved; when omitted or null, all sessions are deleted. Returns the count of deleted sessions.
 * @param pool Database connection pool
 * @param userId Identifier of the user whose sessions to invalidate
 * @param currentSid Session ID of the current request to exclude from deletion
 * @returns Number of invalidated sessions.
 */
export const deleteOtherSessions = async (
  pool: Pool,
  userId: string,
  currentSid?: string,
): Promise<number> => {
  const result = await pool.query(
    `DELETE FROM session
     WHERE sess -> 'user' ->> 'id' = $1
       AND ($2::varchar IS NULL OR sid <> $2)`,
    [String(userId), currentSid ?? null],
  );
  return result.rowCount ?? 0;
};

// Get recent tasks
export const getRecentTasks = async (
  pool: Pool,
  userId: string,
): Promise<Task[]> => {
  const result = await pool.query(`SELECT * FROM recent_tasks($1)`, [userId]);
  return result.rows;
};

/**
 * Retrieve projects associated with the user sorted by recency.
 * @param pool Database connection pool
 * @param userId The identifier of the user
 * @returns Array of projects recently accessed or created by the user
 */
export const getRecentProjects = async (
  pool: Pool,
  userId: string,
): Promise<Project[]> => {
  const result = await pool.query(`SELECT * FROM recent_projects($1)`, [
    userId,
  ]);
  return result.rows;
};
