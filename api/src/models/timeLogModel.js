// Time log model
exports.getTaskTimeLogs = async (pool, taskId) => {
  const result = await pool.query(
    `SELECT * FROM time_logs 
    WHERE task_id = $1 
    ORDER BY start_time DESC`,
    [taskId]
  );
  return result.rows;
};

// Create time log
exports.createTimeLog = async (pool, taskId, userId, timeLogData) => {
  const { start_time, end_time, description } = timeLogData;
  const result = await pool.query(
    `INSERT INTO time_logs 
    (task_id, user_id, start_time, end_time, description)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [taskId, userId, start_time, end_time, description]
  );
  return result.rows[0];
};

// Update time log
exports.updateTimeLog = async (pool, timeLogId, timeLogData) => {
  const { start_time, end_time, description } = timeLogData;
  const result = await pool.query(
    `UPDATE time_logs 
    SET start_time = $1, end_time = $2, description = $3
    WHERE id = $4
    RETURNING *`,
    [start_time, end_time, description, timeLogId]
  );
  return result.rows[0];
};

// Delete time log
exports.deleteTimeLog = async (pool, timeLogId) => {
  await pool.query(
    'DELETE FROM time_logs WHERE id = $1',
    [timeLogId]
  );
};

// Get user time logs
exports.getUserTimeLogs = async (pool, userId, params) => {
  const result = await pool.query(
    `SELECT * FROM time_logs 
    WHERE user_id = $1 
    ORDER BY start_time DESC`,
    [userId]
  );
  return result.rows;
}; 