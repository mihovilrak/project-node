import { Pool } from 'pg';
import { Profile, ProfileUpdateInput } from '../types/profile';
import { Task } from '../types/task';
import { Project } from '../types/project';
import { buildUpdateAssignments } from '../utils/sqlUpdate';

const PROFILE_COLUMNS =
  'id, login, name, surname, email, status_id, role_id, created_on, updated_on';
const PROFILE_UPDATABLE_COLUMNS = ['email', 'name', 'surname'] as const;

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
 * Only the fields present in profileData are written. Returns the profile in
 * the get_profile() shape (as GET /profile), the current profile when no field
 * is given, or null if the user does not exist.
 *
 * @param pool Database connection pool
 * @param userId The ID of the user whose profile is being updated
 * @param profileData Object containing optional fields: name, surname, and
 *   email to update
 * @returns The updated Profile object or null if no matching user was found
 */
export const updateProfile = async (
  pool: Pool,
  userId: string,
  profileData: ProfileUpdateInput,
): Promise<Profile | null> => {
  const assignments = buildUpdateAssignments(
    profileData as Record<string, unknown>,
    PROFILE_UPDATABLE_COLUMNS,
  );
  if (!assignments) {
    return getProfile(pool, userId);
  }

  const result = await pool.query(
    `UPDATE users
     SET ${assignments.setClause}
     WHERE id = $${assignments.nextIndex}`,
    [...assignments.values, userId],
  );
  return result.rowCount ? getProfile(pool, userId) : null;
};

/**
 * Verify that a password matches the stored credential for a user by
 * identifier.
 *
 * This function accepts a user identifier rather than a login name; callers
 * needing to authenticate by login credentials should use authentication()
 * instead. Password comparison uses cryptographic hashing via the database
 * crypt function.
 *
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
 * Update the user's password with bcrypt hashing and return the updated
 * profile.
 *
 * The password is hashed using bcrypt with a cost factor of 12 before storage.
 * The update timestamp is set by the users update trigger.
 *
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
     SET password = crypt($1, gen_salt('bf', 12))
     WHERE id = $2
     RETURNING ${PROFILE_COLUMNS}`,
    [password, userId],
  );
  return result.rows[0] || null;
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
 *
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
