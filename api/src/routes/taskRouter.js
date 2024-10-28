const express = require('express');
const taskController = require('../controllers/taskController');

module.exports = (pool) => {
  const router = express.Router();

  // Get all tasks (with optional filters)
  router.get('/', (req, res) => taskController.getAllTasks(req, res, pool));

  // Get a task by ID
  router.get('/:id', (req, res) => taskController.getTaskById(req, res, pool));

  // Create a new task
  router.post('/', (req, res) => taskController.createTask(req, res, pool));

  // Edit a task
  router.put('/:id', (req, res) => taskController.updateTask(req, res, pool));

  // Change task status (Active/Inactive/Deleted)
  router.patch('/:id/status', (req, res) => taskController.changeTaskStatus(req, res, pool));

  // Soft delete a task (change status to 'Deleted')
  router.delete('/:id', (req, res) => taskController.deleteTask(req, res, pool));

  // Get task statuses
  router.get('/statuses', (req, res) => taskController.getTaskStatuses(req, res, pool));

  // Get task priorities
  router.get('/priorities', (req, res) => taskController.getPriorities(req, res, pool));

  return router;
};
