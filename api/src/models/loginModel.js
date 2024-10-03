exports.login = async (pool, email, password) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND crypt($2, password)', 
    [email, password]
    );
    return result.rows[0];
  };
  
  exports.createUser = async (pool, username, email, password) => {
    const result = await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, crypt($3, gen_salt('bf', 12))) RETURNING *`,
      [username, email, password]
    );
    return result.rows[0];
  };