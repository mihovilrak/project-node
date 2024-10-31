exports.getTaskFiles = async (pool, taskId) => {
  const result = await pool.query(
    'SELECT * FROM files WHERE task_id = $1 ORDER BY created_on DESC',
    [taskId]
  );
  return result.rows;
};

exports.createFile = async (
  pool,
  taskId,
  userId,
  originalName,
  storedName,
  size,
  mimeType
) => {
  const result = await pool.query(
    `INSERT INTO files (
      task_id, 
      user_id, 
      original_name, 
      stored_name, 
      size, 
      mime_type
    ) VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *`,
    [taskId, userId, originalName, storedName, size, mimeType]
  );
  return result.rows[0];
};

exports.getFileById = async (pool, fileId) => {
  const result = await pool.query(
    'SELECT * FROM files WHERE id = $1',
    [fileId]
  );
  return result.rows[0];
};

exports.deleteFile = async (pool, fileId) => {
  await pool.query(
    'DELETE FROM files WHERE id = $1',
    [fileId]
  );
};
  