// Get all tasks
exports.getTasks = async (pool, whereParams) => {
  let query = 'SELECT * FROM v_tasks';
  let values = [];

  if (whereParams && Object.keys(whereParams).length > 0) {
    query += ' WHERE ';
    const conditions = [];

    Object.keys(whereParams).forEach((param, index) => {
      conditions.push(`${param} = $${index + 1}`);
      values.push(whereParams[param]);
    });

    query += conditions.join(' AND ');
  }

  const result = await pool.query(query, values);
  return result.rows;
};

// Get a task by ID
exports.getTaskById = async (pool, id) => {
  const result = await pool.query(
    `SELECT * FROM v_tasks 
    WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

// Create a task
exports.createTask = async (
  pool,
  name,
  description,
  estimatedTime,
  startDate,
  dueDate,
  priorityId,
  statusId,
  typeId,
  parentId,
  projectId,
  holderId,
  assigneeId,
  createdBy, 
  tagIds
) => {
  const result = await pool.query(
    `SELECT * FROM create_task (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12,
      $13,
      $14
    )`,
    [name, description, estimatedTime, startDate, dueDate, priorityId, statusId, typeId, parentId, projectId, holderId, assigneeId, createdBy, tagIds]
  );
  return result.rows[0];
};

// Define standard task update interface
exports.updateTask = async (pool, taskId, taskData) => {
  const allowedFields = [
    'name',
    'project_id',
    'holder_id',
    'assignee_id',
    'description',
    'estimated_time',
    'status_id',
    'priority_id',
    'start_date',
    'due_date',
    'end_date'
  ];

  // Filter out undefined values and invalid fields
  const updates = Object.entries(taskData)
    .filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  if (Object.keys(updates).length === 0) {
    return null;
  }

  const setClause = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  const result = await pool.query(
    `UPDATE tasks 
     SET ${setClause}
     WHERE id = $${Object.keys(updates).length + 1}
     RETURNING *`,
    [...Object.values(updates), taskId]
  );

  return result.rows[0];
};

// Change a task status
exports.changeTaskStatus = async (pool, id, statusId) => {
  const result = await pool.query(
    `UPDATE tasks 
    SET (status_id, updated_on) = ($1, CURRENT_TIMESTAMP)
    WHERE id = $2 
    RETURNING *`,
    [statusId, id]
  );
  return result.rows[0];
};

// Delete a task
exports.deleteTask = async (pool, id) => {
  const result = await pool.query(
    `UPDATE tasks 
    SET (status_id, updated_on) = (3, CURRENT_TIMESTAMP)
    WHERE id = $1 
    RETURNING *`,
    [id]
  );
  return result.rows[0];
};

// Get task statuses
exports.getTaskStatuses = async (pool) => {
  const result = await pool.query(
    `SELECT id, name 
    FROM task_statuses`
  );
  return result.rows;
};

// Get priorities
exports.getPriorities = async (pool) => {
  const result = await pool.query(
    `SELECT id, name 
    FROM priorities`
  );
  return result.rows;
};

// Get active tasks
exports.getActiveTasks = async (pool, userId) => {
  const result = await pool.query(
    `SELECT * FROM v_tasks 
    WHERE assignee_id = $1
    AND status_name NOT IN ('Done', 'Cancelled', 'Deleted')`,
    [userId]
  );
  return result.rows;
};

// Get tasks by project
exports.getTasksByProject = async (pool, project_id) => {
  const result = await pool.query(
    `SELECT * FROM v_tasks 
    WHERE project_id = $1 
    ORDER BY created_on DESC`,
    [project_id]
  );
  return result.rows;
};

// Get subtasks
exports.getSubtasks = async (pool, parentId) => {
  const result = await pool.query(
    `SELECT * FROM tasks 
    WHERE parent_id = $1 
    ORDER BY created_on ASC`,
    [parentId]
  );
  return result.rows;
};
