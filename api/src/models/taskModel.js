exports.getTasks = async (pool, status, projectId) => {
    let query = 'SELECT * FROM v_tasks';
    let params = [];
  
    if (status) {
      query += ' WHERE status_id = $1';
      params.push(status);
    }
  
    if (projectId) {
      query += params.length ? ' AND project_id = $2' : ' WHERE project_id = $1';
      params.push(projectId);
    }
  
    const result = await pool.query(query, params);
    return result.rows;
  };
  
  exports.getTaskById = async (pool, id) => {
    const result = await pool.query('SELECT * FROM v_tasks WHERE id = $1', [id]);
    return result.rows[0];
  };

  exports.getTasksByAssignee = async (pool, assignee_id) => {
    const result = await pool.query('SELECT * FROM v_tasks WHERE assignee_id = $1', [assignee_id]);
    return result.rows;
  };

  exports.getTasksByHolder = async (pool, holder_id) => {
    const result = await pool.query('SELECT * FROM v_tasks WHERE holder_id = $1', [holder_id]);
  };
  
  exports.createTask = async (pool, name, project_id, holder_id, assignee_id, description, priority_id, start_date, due_date, created_by) => {
    const result = await pool.query(
      'INSERT INTO tasks (name, project_id, holder_id, assignee_id, description, priority_id, start_date, due_date, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, project_id, holder_id, assignee_id, description, priority_id, start_date, due_date, created_by]
    );
    return result.rows[0];
  };
  
  exports.updateTask = async (pool, id, name, project_id, holder_id, assignee_id, description, status_id, priority_id, start_date, due_date, end_date) => {
    const result = await pool.query(
      'UPDATE tasks SET (name, project_id, holder_id, assignee_id, description, status_id, priority_id, start_date, due_date, end_date) = ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) WHERE id = $11 RETURNING *',
      [name, project_id, holder_id, assignee_id, description, status_id, priority_id, start_date, due_date, end_date, id]
    );
    return result.rows[0];
  };
  
  exports.changeTaskStatus = async (pool, id, status) => {
    const result = await pool.query(
      'UPDATE tasks SET status_id = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  };
  
  exports.deleteTask = async (pool, id) => {
    const result = await pool.query(
      'UPDATE tasks SET status_id = 3 WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  };
  