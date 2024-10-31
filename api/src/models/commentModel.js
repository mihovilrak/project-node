exports.getTaskComments = async (pool, taskId) => {
  const result = await pool.query(
    'SELECT * FROM v_comments WHERE task_id = $1 ORDER BY created_on DESC',
    [taskId]
  );
  return result.rows;
};

exports.createComment = async (pool, taskId, userId, comment) => {
  const result = await pool.query(
    `INSERT INTO comments (task_id, user_id, comment) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [taskId, userId, comment]
  );
  
  // Fetch the created comment with user details
  const commentWithUser = await pool.query(
    'SELECT * FROM v_comments WHERE id = $1',
    [result.rows[0].id]
  );
  
  return commentWithUser.rows[0];
};

exports.editComment = async (pool, id, comment) => {
    const result = await pool.query(
        'UPDATE comments SET comment = $2 WHERE id = $1',
        [id, comment]
    );
    return result.rows[0];
  }
  
  exports.deleteComment = async (pool, id) => {
    const result = await pool.query(
        'UPDATE comments SET active = false WHERE id = $1',
        [id]
    );
    return result.rows[0];
  }