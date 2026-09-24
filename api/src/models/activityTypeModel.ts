import { Pool } from 'pg';
import { ActivityType, ActivityTypeUpdateInput } from '../types/activityType';
import { buildUpdateAssignments } from '../utils/sqlUpdate';

export const ALLOWED_ACTIVITY_TYPE_UPDATE_KEYS = [
  'name',
  'description',
  'color',
  'icon',
] as const;

/**
 * Retrieve all active activity types ordered by name.
 *
 * Queries the database for activity types where the active flag is true, returning results sorted alphabetically by name.
 * @param pool Database connection pool for executing the query
 * @returns Promise resolving to an array of active ActivityType records
 */
export const getActivityTypes = async (pool: Pool): Promise<ActivityType[]> => {
  const result = await pool.query(
    `SELECT * FROM activity_types
    WHERE active = true
    ORDER BY name ASC`,
  );
  return result.rows;
};

/**
 * Insert a new activity type into the database and return the created record.
 * @param pool Database connection pool
 * @param name The activity type name
 * @param description Optional description of the activity type
 * @param color Hex color code for the activity type
 * @param icon Optional icon identifier for the activity type
 * @returns The newly created ActivityType object with generated id and timestamps
 */
export const createActivityType = async (
  pool: Pool,
  name: string,
  description: string | null,
  color: string,
  icon: string | null,
): Promise<ActivityType> => {
  const result = await pool.query(
    `INSERT INTO activity_types
    (name, description, color, icon)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [name, description, color, icon],
  );
  return result.rows[0];
};

/**
 * Update an activity type with specified field changes, returning the modified record or null if not found.
 *
 * Only active activity types can be updated. If no updates are provided, returns the current record. Updates are filtered to allowed fields: name, description, color, icon, and active status. The updated_on timestamp is automatically set to the current time.
 * @param pool Database connection pool
 * @param id Activity type identifier
 * @param updates Object containing fields to update
 */
export const updateActivityType = async (
  pool: Pool,
  id: string,
  updates: ActivityTypeUpdateInput,
): Promise<ActivityType | null> => {
  const assignments = buildUpdateAssignments(
    updates as Record<string, unknown>,
    ALLOWED_ACTIVITY_TYPE_UPDATE_KEYS,
  );
  if (!assignments) {
    const current = await pool.query(
      `SELECT * FROM activity_types WHERE id = $1 AND active = true`,
      [id],
    );
    return current.rows[0] || null;
  }

  const result = await pool.query(
    `UPDATE activity_types
    SET ${assignments.setClause}, updated_on = CURRENT_TIMESTAMP
    WHERE id = $${assignments.nextIndex} AND active = true
    RETURNING *`,
    [...assignments.values, id],
  );
  return result.rows[0] || null;
};

/**
 * Deactivate an activity type by marking it as inactive without removing it from the database.
 *
 * Sets the active flag to false and updates the timestamp. Returns the updated activity type record or null if no matching id exists.
 * @param pool Database connection pool
 * @param id The activity type identifier to deactivate
 * @returns The deactivated ActivityType object, or null if not found
 */
export const deleteActivityType = async (
  pool: Pool,
  id: string,
): Promise<ActivityType | null> => {
  const result = await pool.query(
    `UPDATE activity_types
    SET (active, updated_on) = (false, CURRENT_TIMESTAMP)
    WHERE id = $1
    RETURNING *`,
    [id],
  );
  return result.rows[0] || null;
};
