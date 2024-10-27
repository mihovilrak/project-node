exports.getUsers = async (pool, whereParams) => {
  let query = 'SELECT * FROM users';
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
  
  exports.getUserById = async (pool, id) => {
    const result = await pool.query('SELECT * FROM v_users WHERE id = $1', [id]);
    return result.rows[0];
  };
  
  exports.createUser = async (pool, login, name, surname, email, password, role_id) => {
    const result = await pool.query(
      `INSERT INTO users (login, name, surname, email, password, role_id) 
      VALUES ($1, $2, $3, $4, crypt($5, gen_salt('bf', 12))), $6 RETURNING *`,
      [login, name, surname, email, password, role_id]
    );
    return result.rows[0];
  };
  
  exports.updateUser = async (pool, updates, id) => {
    const columns = Object.keys(updates);
    const values = [];
  
    let setExpressions = columns.map((column, index) => {
      if (column === 'password') {
        values.push(updates[column]);
        return `password = crypt($${index + 1}, gen_salt('bf', 12))`;
      } else {
        values.push(updates[column]);
        return `$${index + 1}`;
      }
    });
  
    let query = `UPDATE users SET (${columns.join(', ')}) = 
    (${setExpressions.join(', ')}) WHERE id = $${columns.length + 1}`;
  
    values.push(id);
  
    const result = await pool.query(query, values);
  
    return result.rowCount;
  };
  
  
  exports.changeUserStatus = async (pool, id, status) => {
    const result = await pool.query(
      'UPDATE users SET status_id = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  };
  
  exports.deleteUser = async (pool, id) => {
    const result = await pool.query(
      'UPDATE users SET status_id = 3 WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  };
  