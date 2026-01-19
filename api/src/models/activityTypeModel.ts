import { Pool } from 'pg';
import { ActivityType } from '../types/activityType';

// Activity Type Model
export const getActivityTypes = async (pool: Pool): Promise<ActivityType[]> => {
  const result = await pool.query(
    `SELECT * FROM activity_types
    WHERE active = true
    ORDER BY name ASC`
  );
  return result.rows;
};

// Create Activity Type
export const createActivityType = async (
  pool: Pool,
  name: string,
  description: string | null,
  color: string,
  icon: string | null
): Promise<ActivityType> => {
  const result = await pool.query(
    `INSERT INTO activity_types
    (name, description, color, icon)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [name, description, color, icon]
  );
  return result.rows[0];
};

// Update Activity Type
export const updateActivityType = async (
  pool: Pool,
  id: string,
  name: string,
  description: string | null,
  color: string,
  icon: string | null
): Promise<ActivityType | null> => {
  const result = await pool.query(
    `UPDATE activity_types
    SET (name, description, color, icon, updated_on) = ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    WHERE id = $5 AND active = true
    RETURNING *`,
    [name, description, color, icon, id]
  );
  return result.rows[0] || null;
};

// Delete Activity Type
export const deleteActivityType = async (pool: Pool, id: string): Promise<ActivityType | null> => {
  const result = await pool.query(
    `UPDATE activity_types
    SET (active, updated_on) = (false, CURRENT_TIMESTAMP)
    WHERE id = $1
    RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};
