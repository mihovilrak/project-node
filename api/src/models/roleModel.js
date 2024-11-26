// Get all roles
exports.getRoles = async (pool) => {
  const results = await pool.query(`
    SELECT * FROM get_roles()
  `);
  return results.rows;
};

exports.createRole = async (pool, roleData) => {
  const { name, description, active, permissions } = roleData;
  try {
    const roleResult = await pool.query(
      'SELECT create_role($1, $2, $3, $4) as id',
      [name, description, active, permissions]
    );
    return roleResult.rows[0].id;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

exports.updateRole = async (pool, id, roleData) => {
  const { name, description, active, permissions } = roleData;
  try {
    await pool.query(
      'SELECT update_role($1, $2, $3, $4, $5)',
      [id, name, description, active, permissions]
    );
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};