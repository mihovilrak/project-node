// Time log model
exports.getAllTimeLogs = async (pool) => {
  const result = await pool.query(
    `SELECT * FROM v_time_logs 
    ORDER BY created_on DESC`
  );
  return result.rows;
};

// Create time log
exports.createTimeLog = async (pool, taskId, userId, timeLogData) => {
  const { spent_time, description, activity_type_id } = timeLogData;
  const result = await pool.query(
    `INSERT INTO time_logs 
    (task_id, user_id, spent_time, description, activity_type_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [taskId, userId, spent_time, description, activity_type_id]
  );
  return result.rows[0];
};

// Update time log
exports.updateTimeLog = async (pool, timeLogId, timeLogData) => {
  const { spent_time, description, activity_type_id } = timeLogData;
  const result = await pool.query(
    `UPDATE time_logs 
    SET (spent_time, description, activity_type_id) = ($1, $2, $3)
    WHERE id = $4
    RETURNING *`,
    [spent_time, description, activity_type_id, timeLogId]
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
    `SELECT * FROM v_time_logs 
    WHERE user_id = $1 
    ORDER BY created_on DESC`,
    [userId]
  );
  return result.rows;
}; 

// Get project time logs
exports.getProjectTimeLogs = async (pool, projectId, params) => {
  const result = await pool.query(
    `SELECT * FROM v_time_logs 
    WHERE project_id = $1 
    ORDER BY created_on DESC`,
    [projectId]
  );
  return result.rows;
};

// Get project spent time
exports.getProjectSpentTime = async (pool, projectId) => {
  const result = await pool.query(
    `SELECT * FROM v_project_spent_time 
    WHERE project_id = $1`,
    [projectId]
  );
  return result.rows[0];
};

// Get task time logs
exports.getTaskTimeLogs = async (pool, taskId) => {
  const result = await pool.query(
    `SELECT * FROM v_time_logs 
    WHERE task_id = $1`,
    [taskId]
  );
  return result.rows;
};

// Get task spent time
exports.getTaskSpentTime = async (pool, taskId) => {
  const result = await pool.query(
    `SELECT * FROM v_task_spent_time 
    WHERE task_id = $1`,
    [taskId]
  );
  return result.rows[0];
};
