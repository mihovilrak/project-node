exports.getCommentsByTaskId = async (pool, task_id) => {
    const result = await pool.query(
      'SELECT * FROM v_comments WHERE task_id = $1',
      [task_id]
    );
    return result.rows;
  };
  
  exports.addComment = async (pool, task_id, user_id, comment) => {
    const result = await pool.query(
      'INSERT INTO comments (task_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *',
      [task_id, user_id, comment]
    );
    return result.rows[0];
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