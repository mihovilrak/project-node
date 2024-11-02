// Get all task types
exports.getTaskTypes = async (pool) => {
  const result = await pool.query(
    `SELECT * FROM task_types 
    WHERE is_active = true 
    ORDER BY name ASC`
  );
  return result.rows;
};

// Get a task type by ID
exports.getTaskTypeById = async (pool, id) => {
  const result = await pool.query(
    `SELECT * FROM task_types 
    WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

// Create a task type
exports.createTaskType = async (
  pool,
  name,
  description,
  color,
  icon,
  is_active
) => {
  const result = await pool.query(
    `INSERT INTO task_types 
    (name, description, color, icon, is_active) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`,
    [name, description, color, icon, is_active]
  );
  return result.rows[0];
};

// Update a task type
exports.updateTaskType = async (pool, id, name, description, color, icon, is_active) => {
  const result = await pool.query(
    `UPDATE task_types 
    SET name = $1, 
        description = $2, 
        color = $3, 
        icon = $4, 
        is_active = $5, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = $6 
    RETURNING *`,
    [name, description, color, icon, is_active, id]
  );
  return result.rows[0];
};

// Delete a task type
exports.deleteTaskType = async (pool, id) => {
  const result = await pool.query(
    `UPDATE task_types 
    SET is_active = false, 
    updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1 
    RETURNING *`,
    [id]
  );
  return result.rows[0];
};
