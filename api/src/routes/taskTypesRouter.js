const express = require('express');
const taskTypeController = require('../controllers/taskTypeController');
const { checkPermission } = require('../middleware/permissionMiddleware');
const router = express.Router();

module.exports = (pool) => {

// Get task 
router.get('/', (req, res) =>
  taskTypeController.getTaskTypes(req, res, pool));

  // Get task type by ID
  router.get('/:id', (req, res) =>
    taskTypeController.getTaskTypeById(req, res, pool));

  // Create a new task type
  router.post('/', checkPermission(pool, 'Admin'), (req, res) =>
    taskTypeController.createTaskType(req, res, pool));

  // Update a task type
  router.put('/:id', checkPermission(pool, 'Admin'), (req, res) =>
    taskTypeController.updateTaskType(req, res, pool));

  // Delete a task type
  router.delete('/:id', checkPermission(pool, 'Admin'), (req, res) =>
    taskTypeController.deleteTaskType(req, res, pool));

  return router;
};