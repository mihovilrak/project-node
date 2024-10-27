exports.login = async (pool, login, password) => {
    const result = await pool.query(
      'SELECT * FROM authentification($1, $2)',
    [login, password]
    );
    return result.rows[0];
  };