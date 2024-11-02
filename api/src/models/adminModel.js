// Check if user is admin
exports.isUserAdmin = async (pool, userId) => {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1 AND r.name = 'admin'
    )`,
    [userId]
  );
  return result.rows[0].exists;
};

// Get system statistics
exports.getSystemStats = async (pool) => {
  const result = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE status_id != 3) as active_users,
      (SELECT COUNT(*) FROM projects WHERE status_id != 3) as active_projects,
      (SELECT COUNT(*) FROM tasks WHERE status_id != 3) as active_tasks,
      (SELECT COUNT(*) FROM time_logs 
       WHERE created_on >= NOW() - INTERVAL '30 days') as time_logs_30d
  `);
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