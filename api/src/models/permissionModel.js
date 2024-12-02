// Get all permissions for a user
exports.getUserPermissions = async (pool, userId) => {
  const result = await pool.query(
    'SELECT * FROM get_user_permissions($1)',
    [userId]
  );
  return result.rows;
};

// Check if a user has a specific permission
exports.hasPermission = async (pool, userId, requiredPermission) => {
  const result = await pool.query(
    'SELECT permission_check($1, $2)',
    [userId, requiredPermission]
  );
  
  return result.rows[0].permission_check;
};
