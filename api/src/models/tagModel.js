// Get all tags
exports.getTags = async (pool) => {
  const result = await pool.query(
    `SELECT * FROM tags 
    WHERE active = true 
    ORDER BY name ASC` 
  );
  return result.rows;
};

// Create a tag
exports.createTag = async (pool, name, color, userId) => {
  const result = await pool.query(
    `INSERT INTO tags (name, color, created_by) 
    VALUES ($1, $2, $3) 
    RETURNING *`,
    [name, color, userId]
  );
  return result.rows[0];
};

// Add tags to task
exports.addTaskTags = async (pool, taskId, tagIds) => {
  await pool.query(
    `SELECT add_task_tags($1, $2)`,
    [taskId, tagIds]
  );
};

// Remove tag from task
exports.removeTaskTag = async (pool, taskId, tagId) => {
  await pool.query(
    `DELETE FROM task_tags 
    WHERE task_id = $1 AND tag_id = $2`,
    [taskId, tagId]
  );
};

// Get task tags
exports.getTaskTags = async (pool, taskId) => {
  const result = await pool.query(
    `SELECT t.* 
    FROM tags t
    JOIN task_tags tt ON t.id = tt.tag_id
    WHERE tt.task_id = $1 AND t.active = true
    ORDER BY t.name ASC`,
    [taskId]
  );
  return result.rows;
};

// Update tag
exports.updateTag = async (pool, id, name, color) => {
  const result = await pool.query(
    `UPDATE tags 
    SET (name, color, updated_at) = ($1, $2, CURRENT_TIMESTAMP)
    WHERE id = $3
    RETURNING *`,
    [name, color, id]
  );
  return result.rows[0];
};

// Delete tag
exports.deleteTag = async (pool, id) => {
  const result = await pool.query(
    `UPDATE tags 
    SET (active, updated_at) = (false, CURRENT_TIMESTAMP)
    WHERE id = $1 
    RETURNING *`,
    [id]
  );
  return result.rows[0];
}; 