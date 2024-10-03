exports.getProjects = async (pool, status) => {
    let query = 'SELECT * FROM projects';
    let params = [];
  
    if (status) {
      query += ' WHERE status_id = $1';
      params.push(status);
    }
  
    const result = await pool.query(query, params);
    return result.rows;
  };

  exports.getProject = async (pool, id) => {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    return result.rows[0];
  };
  
  exports.createProject = async (pool, name, description, start_date, due_date, created_by) => {
    const result = await pool.query(
      'INSERT INTO projects (name, description, start_date, due_date, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, start_date, due_date, created_by]
    );
    return result.rows[0];
  };
  
  exports.changeProjectStatus = async (pool, id) => {
    const result = await pool.query(
      'SELECT * FROM change_project_status($1) RETURNING *',
      [id]
    );
    return result.rows[0];
  };
  
  exports.deleteProject = async (pool, id) => {
    await pool.query('SELECT delete_project($1) AS message', [id]);
  };
  