exports.login = async (pool, login, password) => {
    const result = await pool.query(
      'SELECT * FROM authentification($1, $2)',
    [login, password]
    );
    return result.rows[0];
  };

exports.app_logins = async (pool, id) => {
  const result = await pool.query(
    'INSERT INTO app_logins (user_id) VALUES ($1)',
  [id]
  );
  return result.rows[0];
}