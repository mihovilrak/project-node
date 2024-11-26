// Get System Settings
exports.getSystemSettings = async (pool) => {
  const result = await pool.query(
    `SELECT * FROM app_settings WHERE id = 1`
  );
  return result.rows[0];
};

// Update System Settings
exports.updateSystemSettings = async (pool, settings) => {
  const { company_name, sender_email, time_zone, theme } = settings;
  const result = await pool.query(
    `UPDATE app_settings 
     SET (company_name, sender_email, time_zone, theme, updated_on) 
        = ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     WHERE id = 1
     RETURNING *`,
    [company_name, sender_email, time_zone, theme]
  );
  return result.rows[0];
};

// Get User Settings
exports.getUserSettings = async (pool, userId) => {
  const result = await pool.query(
    `SELECT * FROM user_settings WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
};

// Update User Settings
exports.updateUserSettings = async (pool, userId, settings) => {
  const { theme, language, notifications_enabled, email_notifications_enabled } = settings;
  const result = await pool.query(
    `INSERT INTO user_settings (user_id, theme, language, notifications_enabled, email_notifications_enabled)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE
     SET (theme, language, notifications_enabled, email_notifications_enabled, updated_on)
        = ($2, $3, $4, $5, CURRENT_TIMESTAMP)
     RETURNING *`,
    [userId, theme, language, notifications_enabled, email_notifications_enabled]
  );
  return result.rows[0];
};
