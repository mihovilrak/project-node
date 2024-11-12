// Get user profile
exports.getProfile = async (pool, userId) => {
  const result = await pool.query(
    `SELECT *
     FROM v_profiles
     WHERE id = $1`,
    [userId]
  );
  return result.rows[0];
};

// Update user profile
exports.updateProfile = async (pool, userId, profileData) => {
  const { email, name, surname } = profileData;
  
  const result = await pool.query(
    `UPDATE users 
     SET (email, name, surname, updated_on) = ($1, $2, $3, CURRENT_TIMESTAMP)
     WHERE id = $4 
     RETURNING *`,
    [email, name, surname, userId]
  );
  return result.rows[0];
};

// Verify user password
exports.verifyPassword = async (pool, userId, password) => {
  const result = await pool.query(
    `SELECT EXISTS(SELECT 1 FROM authentification($1, $2))`,
    [userId, password]
  );
  return result.rows[0].exists;
};

// Change user password
exports.changePassword = async (pool, userId, password) => {
  const result = await pool.query(
    `UPDATE users 
     SET (password, updated_on) = (crypt($1, gen_salt('bf', 12)), CURRENT_TIMESTAMP)
     WHERE id = $2
     RETURNING *`,
    [password, userId]
  );
  return result.rows[0];
};

// Get recent tasks
exports.getRecentTasks = async (pool, userId) => {
  const result = await pool.query(
    `SELECT * FROM recent_tasks($1)`,
    [userId]
  );
  return result.rows;
};

// Get recent projects
exports.getRecentProjects = async (pool, userId) => {
  const result = await pool.query(
    `SELECT * FROM recent_projects($1)`,
    [userId]
  );
  return result.rows;
};