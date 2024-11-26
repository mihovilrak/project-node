// Activity Type Model
exports.getActivityTypes = async (pool) => {
  const result = await pool.query(
    `SELECT * FROM activity_types 
    WHERE active = true 
    ORDER BY name ASC`
  );
  return result.rows;
};

// Create Activity Type
exports.createActivityType = async (
  pool,
  name,
  description,
  color,
  icon
) => {
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
    SET (name, description, color, icon, updated_on) = ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
    WHERE id = $5 AND active = true 
    RETURNING *`,
    [name, description, color, icon, id]
  );
  return result.rows[0];
};

// Delete Activity Type
exports.deleteActivityType = async (pool, id) => {
  const result = await pool.query(
    `UPDATE activity_types 
    SET (active, updated_on) = (false, CURRENT_TIMESTAMP) 
    WHERE id = $1 
    RETURNING *`,
    [id]
  );
  return result.rows[0];
}; 