exports.getActivityTypes = async (pool) => {
  const result = await pool.query(
    `SELECT * FROM activity_types 
    WHERE is_active = true 
    ORDER BY name ASC`
  );
  return result.rows;
};

exports.createActivityType = async (
  pool,
  name,
  description,
  color,
  icon,
  created_by
) => {
  const result = await pool.query(
    `INSERT INTO activity_types 
    (name, description, color, icon, created_by) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`,
    [name, description, color, icon, created_by]
  );
  return result.rows[0];
};

exports.updateActivityType = async (
  pool,
  id,
  name,
  description,
  color,
  icon
) => {
  const result = await pool.query(
    `UPDATE activity_types 
    SET name = $1, 
        description = $2, 
        color = $3, 
        icon = $4, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = $5 AND is_active = true 
    RETURNING *`,
    [name, description, color, icon, id]
  );
  return result.rows[0];
};

exports.deleteActivityType = async (pool, id) => {
  const result = await pool.query(
    `UPDATE activity_types 
    SET is_active = false, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1 
    RETURNING *`,
    [id]
  );
  return result.rows[0];
}; 