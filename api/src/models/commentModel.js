// Get all comments for a task
exports.getTaskComments = async (pool, taskId) => {
  const result = await pool.query(
    `SELECT * FROM v_comments 
    WHERE task_id = $1 
    ORDER BY created_on DESC`,
    [taskId]
  );
  return result.rows;
};

// Create a new comment for a task
exports.createComment = async (pool, taskId, userId, comment) => {
  const result = await pool.query(
    `INSERT INTO comments (task_id, user_id, comment) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [taskId, userId, comment]
  );
  return result.rows[0];
};

// Fetch the created comment with user details
exports.commentWithUser = async (pool, id) => {
  const result = await pool.query(
    `SELECT * FROM v_comments 
    WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

// Edit a comment
exports.editComment = async (pool, id, comment) => {
  const result = await pool.query(
    `UPDATE comments 
    SET (comment, updated_on) = ($2, current_timestamp) 
    WHERE id = $1`,
    [id, comment]
  );
  return result.rows[0];
};

// Delete a comment
exports.deleteComment = async (pool, id) => {
  const result = await pool.query(
    `UPDATE comments 
    SET (active, updated_on) = (false, current_timestamp) 
    WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};
