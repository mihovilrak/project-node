import { Pool } from 'pg';
import { Settings, SettingsUpdateInput } from '../types/settings';

// Get System Settings
export const getSystemSettings = async (pool: Pool): Promise<Settings | null> => {
  const result = await pool.query(
    `SELECT * FROM app_settings WHERE id = 1`
  );
  return result.rows[0] || null;
};

// Update System Settings
export const updateSystemSettings = async (
  pool: Pool,
  settings: SettingsUpdateInput
): Promise<Settings | null> => {
  const {
    theme,
    language,
    notifications_enabled,
    email_notifications
  } = settings;
  const result = await pool.query(
    `UPDATE app_settings 
     SET (theme, language, notifications_enabled, email_notifications, updated_on) 
        = ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     WHERE id = 1
     RETURNING *`,
    [theme, language, notifications_enabled, email_notifications]
  );
  return result.rows[0] || null;
};

// Get User Settings
export const getUserSettings = async (
  pool: Pool,
  userId: string
): Promise<Settings | null> => {
  const result = await pool.query(
    `SELECT * FROM user_settings WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

// Update User Settings
export const updateUserSettings = async (
  pool: Pool,
  userId: string,
  settings: SettingsUpdateInput
): Promise<Settings | null> => {
  const {
    theme,
    language,
    notifications_enabled,
    email_notifications
  } = settings;
  const result = await pool.query(
    `INSERT INTO user_settings (user_id, theme, language, notifications_enabled, email_notifications)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE
     SET (theme, language, notifications_enabled, email_notifications, updated_on)
        = ($2, $3, $4, $5, CURRENT_TIMESTAMP)
     RETURNING *`,
    [userId, theme, language, notifications_enabled, email_notifications]
  );
  return result.rows[0] || null;
};
