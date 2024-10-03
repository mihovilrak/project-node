const jwt = require('jsonwebtoken');
const config = require('../config');
const loginModel = require('../models/loginModel');

// User login
exports.login = async (req, res, pool) => {
  const { email, password } = req.body;

  try {
    const user = await loginModel.login(pool, email, password);

    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, config.jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Register user
exports.register = async (req, res, pool) => {
  const { username, email, password } = req.body;

  try {
    const user = await loginModel.createUser(pool, username, email, password);
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
