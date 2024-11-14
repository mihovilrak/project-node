// Check if user is admin
exports.isUserAdmin = async (pool, userId) => {
  const result = await pool.query(
    `SELECT is_admin($1)`,
    [userId]
  );
  return result.rows[0].is_admin;
};

// Get system statistics
exports.getSystemStats = async (pool) => {
  const result = await pool.query(`SELECT * FROM v_system_stats`);
  return result.rows[0];
};

// Get system logs
exports.getSystemLogs = async (pool, startDate, endDate, type) => {
  let query = `
    SELECT tl.*, u.login as user_login, at.name as activity_name
    FROM time_logs tl
    JOIN users u ON tl.user_id = u.id
    JOIN activity_types at ON tl.activity_type_id = at.id
    WHERE tl.created_on BETWEEN $1 AND $2
  `;
  
  const params = [startDate || '1970-01-01', endDate || 'NOW()'];
  
  if (type) {
    query += ' AND tl.activity_type_id = $3';
    params.push(type);
  }
  
  query += ' ORDER BY tl.created_on DESC';
  
  const result = await pool.query(query, params);
  return result.rows;
};

exports.getAllPermissions = async (pool) => {
  const result = await pool.query(
    `SELECT id, name 
     FROM permissions 
     WHERE active = true 
     ORDER BY name ASC`
  );
  return result.rows;
};