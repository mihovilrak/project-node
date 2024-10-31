const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

module.exports = (pool) => {
  // Get all tasks or filter by project
  router.get('/', (req, res) => taskController.getTasks(req, res, pool));

  // Get single task
  router.get('/:id', (req, res) => taskController.getTaskById(req, res, pool));

  // Create new task
  router.post('/', (req, res) => taskController.createTask(req, res, pool));

  // Update task
  router.put('/:id', (req, res) => taskController.updateTask(req, res, pool));

  // Delete task
  router.delete('/:id', (req, res) => taskController.deleteTask(req, res, pool));

  return router;
}; 