exports.getProjects = async (pool, whereParams) => {
  let query = 'SELECT * FROM projects';
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

  exports.getProjectById = async (pool, id) => {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    return result.rows[0];
  };
  
  exports.createProject = async (
    pool, 
    name, 
    description, 
    start_date, 
    due_date, 
    created_by) => {
    const result = await pool.query(
      `INSERT INTO projects (name, description, start_date, due_date, created_by) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, start_date, due_date, created_by]
    );
    return result.rows[0];
  };
  
  exports.changeProjectStatus = async (pool, id) => {
    const result = await pool.query(
      'SELECT * FROM change_project_status($1)',
      [id]
    );
    return result.rows[0];
  };

  exports.updateProject = async (pool, updates, id) => {
    const columns = Object.keys(updates);
    const values = Object.values(updates);
  
    let query = `UPDATE projects SET (${columns.join(', ')}) = 
    (${columns.map((_, index) => `$${index + 1}`).join(', ')})`;
  
    query += ` WHERE id = $${columns.length + 1}`;
  
    values.push(id);
  
    const result = await pool.query(query, values);
    
    return result.rowCount;
  };
  
  exports.deleteProject = async (pool, id) => {
    const result = await pool.query(
      'SELECT * FROM delete_project($1)', 
      [id]);

    return result.rows[0];
  };
  
  exports.getProjectMembers = async (pool, projectId) => {
    const result = await pool.query(
      'SELECT * FROM v_project_members WHERE project_id = $1',
      [projectId]
    );
    return result.rows;
  };
  
  exports.getSubprojects = async (pool, parentId) => {
    const result = await pool.query(
      'SELECT * FROM v_subprojects WHERE parent_id = $1',
      [parentId]
    );
    return result.rows;
  };
  
  exports.createSubproject = async (
    pool, 
    name, 
    description, 
    start_date, 
    due_date, 
    parent_id,
    created_by
  ) => {
    const result = await pool.query(
      `INSERT INTO projects (
        name, 
        description, 
        start_date, 
        due_date, 
        parent_id, 
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [name, description, start_date, due_date, parent_id, created_by]
    );
    return result.rows[0];
  };
  