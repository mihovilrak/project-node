const userModel = require('../models/userModel');

exports.getUsers = async (req, res, pool) => {
  try {
    const { whereParams } = req.query;
    const users = await userModel.getUsers(pool, whereParams);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserById = async (req, res, pool) => {
  const { id } = req.params;
  try {
    const user = await userModel.getUserById(pool, id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createUser = async (req, res, pool) => {
  const { login, name, surname, email, password, role_id } = req.body;
  try {
    const user = await userModel.createUser(pool, login, name, surname, email, password, role_id);
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUser = async (req, res, pool) => {
  const { id } = req.params;
  const { updates } = req.body;
  try {
    const user = await userModel.updateUser(pool, updates, id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.changeUserStatus = async (req, res, pool) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const user = await userModel.changeUserStatus(pool, id, status);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res, pool) => {
  const { id } = req.params;
  try {
    const user = await userModel.deleteUser(pool, id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
