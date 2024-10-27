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
  
  exports.getTaskById = async (pool, id) => {
    const result = await pool.query('SELECT * FROM v_tasks WHERE id = $1', [id]);
    return result.rows[0];
  };
  
  exports.createTask = async (
    pool, 
    name, 
    project_id, 
    holder_id, 
    assignee_id, 
    description, 
    priority_id, 
    start_date, 
    due_date, 
    created_by
  ) => {
    const result = await pool.query(
      `INSERT INTO tasks (name, project_id, holder_id, assignee_id, 
      description, priority_id, start_date, due_date, created_by) VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, project_id, holder_id, assignee_id, description, 
        priority_id, start_date, due_date, created_by]
    );
    return result.rows[0];
  };
  
  exports.updateTask = async (pool, updates, id) => {
    const columns = Object.keys(updates);
    const values = Object.values(updates);
  
    let query = `UPDATE tasks SET (${columns.join(', ')}) = 
    (${columns.map((_, index) => `$${index + 1}`).join(', ')})`;
  
    query += ` WHERE id = $${columns.length + 1}`;
  
    values.push(id);
  
    const result = await pool.query(query, values);
    
    return result.rowCount;
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
  