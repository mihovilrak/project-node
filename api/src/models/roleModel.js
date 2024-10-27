exports.roles = async (pool) => {
  const results = await pool.query(
    'SELECT id, role FROM roles'
  );
  return results.rows;
};