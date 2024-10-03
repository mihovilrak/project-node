exports.getFilesByTaskId = async (pool, task_id) => {
    const result = await pool.query(
      'SELECT * FROM files WHERE task_id = $1 ORDER BY uploaded_on DESC',
      [task_id]
    );
    return result.rows;
  };
  
  exports.uploadFile = async (pool, task_id, user_id, file_path) => {
    const result = await pool.query(
      'INSERT INTO files (task_id, uploaded_by, file_path) VALUES ($1, $2, $3) RETURNING *',
      [task_id, user_id, file_path]
    );
    return result.rows[0];
  };
  