exports.getUsers = async (pool, status) => {
    let query = 'SELECT * FROM users';
    let params = [];
  
    if (status) {
      query += ' WHERE status_id = $1';
      params.push(status);
    }
  
    const result = await pool.query(query, params);
    return result.rows;
  };
  
  exports.getUserById = async (pool, id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  };
  
  exports.createUser = async (pool, name, email, password) => {
    const result = await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, crypt($3, gen_salt('bf', 12))) RETURNING *`,
      [name, email, password]
    );
    return result.rows[0];
  };
  
  exports.updateUser = async (pool, id, name, email, password) => {
    const result = await pool.query(
      `UPDATE users SET (name, email, password) = ($1, $2, crpyt($3, gen_salt('bf', 12)) WHERE id = $4 RETURNING *`,
      [username, email, password, id]
    );
    return result.rows[0];
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
  