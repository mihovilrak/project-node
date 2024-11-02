// Get all tags
exports.getTags = async (pool) => {
  const result = await pool.query(
    `SELECT * FROM tags 
    WHERE is_active = true 
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
  const values = tagIds.map((tagId) => `(${taskId}, ${tagId})`).join(',');
  const result = await pool.query(
    `INSERT INTO task_tags (task_id, tag_id) 
    VALUES ${values} 
    ON CONFLICT (task_id, tag_id) DO NOTHING 
    RETURNING *`
  );
  return result.rows;
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
    WHERE tt.task_id = $1 AND t.is_active = true
    ORDER BY t.name ASC`,
    [taskId]
  );
  return result.rows;
};

// Update tag
exports.updateTag = async (pool, id, name, color) => {
  const result = await pool.query(
    `UPDATE tags 
    SET name = $1, color = $2, updated_at = CURRENT_TIMESTAMP
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
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 
    RETURNING *`,
    [id]
  );
  return result.rows[0];
}; 