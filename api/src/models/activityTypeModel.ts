import { Pool } from 'pg';
import { ActivityType } from '../types/activityType';
import { LOOKUP_TYPE_KEYS, LookupTypeValues } from '../utils/lookupType';
import { buildUpdateAssignments } from '../utils/sqlUpdate';

/**
 * Retrieve activity types ordered by name; only active ones unless
 * `includeInactive` is set.
 *
 * @param pool Database connection pool for executing the query
 * @param includeInactive Also return deactivated activity types
 */
export const getActivityTypes = async (
  pool: Pool,
  includeInactive = false,
): Promise<ActivityType[]> => {
  const result = await pool.query(
    `SELECT * FROM activity_types
    WHERE active = true OR $1
    ORDER BY name ASC`,
    [includeInactive],
  );
  return result.rows;
};

/**
 * Insert a new activity type and return the created record.
 *
 * @param pool Database connection pool
 * @param input Validated activity type fields; name and color are required
 */
export const createActivityType = async (
  pool: Pool,
  input: {
    name: string;
    description: string | null;
    color: string;
    icon: string | null;
    active: boolean;
  },
): Promise<ActivityType> => {
  const result = await pool.query(
    `INSERT INTO activity_types
    (name, description, color, icon, active)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [input.name, input.description, input.color, input.icon, input.active],
  );
  return result.rows[0];
};

/**
 * Update only the provided fields of an activity type.
 *
 * @param pool Database connection pool
 * @param id Activity type identifier
 * @param updates Validated fields to change; omitted keys are left untouched
 * @returns Updated ActivityType or null if not found
 */
export const updateActivityType = async (
  pool: Pool,
  id: string,
  updates: LookupTypeValues,
): Promise<ActivityType | null> => {
  const assignments = buildUpdateAssignments(updates, LOOKUP_TYPE_KEYS);
  if (!assignments) {
    const current = await pool.query(
      `SELECT * FROM activity_types WHERE id = $1`,
      [id],
    );
    return current.rows[0] || null;
  }

  const result = await pool.query(
    `UPDATE activity_types
    SET ${assignments.setClause}
    WHERE id = $${assignments.nextIndex}
    RETURNING *`,
    [...assignments.values, id],
  );
  return result.rows[0] || null;
};

/**
 * Soft-delete an active activity type.
 *
 * @param pool Database connection pool
 * @param id The activity type identifier to deactivate
 * @returns The deactivated ActivityType, or null if it does not exist or is
 *   already inactive
 */
export const deleteActivityType = async (
  pool: Pool,
  id: string,
): Promise<ActivityType | null> => {
  const result = await pool.query(
    `UPDATE activity_types
    SET active = false
    WHERE id = $1 AND active = true
    RETURNING *`,
    [id],
  );
  return result.rows[0] || null;
};
