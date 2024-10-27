const express = require('express');
const userController = require('../controllers/userController');

module.exports = (pool) => {
  const router = express.Router();

  // Get all users with optional filters
  router.get('/', (req, res) => userController.getUsers(req, res, pool));

  // Get user by ID
  router.get('/:id', (req, res) => userController.getUserById(req, res, pool));

  // Create a new user
  router.post('/', (req, res) => userController.createUser(req, res, pool));

  // Edit a user
  router.put('/:id', (req, res) => userController.updateUser(req, res, pool));

  // Change user status
  router.patch('/:id/status', (req, res) => userController.changeUserStatus(req, res, pool));

  // Delete a user
  router.delete('/:id', (req, res) => userController.deleteUser(req, res, pool));

  return router;
};
