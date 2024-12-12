// Get all files for a task
exports.getTaskFiles = async (pool, taskId) => {
  const result = await pool.query(
    `SELECT 
      f.*,
      u.name || ' ' || u.surname as uploaded_by,
      f.uploaded_on as created_on
    FROM files f
    LEFT JOIN users u ON f.user_id = u.id
    WHERE f.task_id = $1 
    ORDER BY f.uploaded_on DESC`,
    [taskId]
  );
  return result.rows;
};

// Create a new file for a task
exports.createFile = async (
  pool,
  taskId,
  userId,
  originalName,
  storedName,
  size,
  mimeType,
  filePath
) => {
  const result = await pool.query(
    `INSERT INTO files (
      task_id,
      user_id,
      original_name,
      stored_name,
      size,
      mime_type,
      file_path
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *`,
    [taskId, userId, originalName, storedName, size, mimeType, filePath]
  );
  return result.rows[0];
};

// Get a file by ID
exports.getFileById = async (pool, fileId) => {
  const result = await pool.query(
    `SELECT * FROM files 
    WHERE id = $1`,
    [fileId]
  );
  return result.rows[0];
};

// Delete a file
exports.deleteFile = async (pool, fileId) => {
  await pool.query(
    `DELETE FROM files 
    WHERE id = $1`,
    [fileId]
  );
};