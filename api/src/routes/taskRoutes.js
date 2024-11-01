const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

module.exports = (pool) => {
  // Task Routes
  router.get('/', (req, res) => taskController.getTasks(req, res, pool));
  router.get('/:id', (req, res) => taskController.getTaskById(req, res, pool));
  router.post('/', (req, res) => taskController.createTask(req, res, pool));
  router.put('/:id', (req, res) => taskController.updateTask(req, res, pool));
  router.delete('/:id', (req, res) => taskController.deleteTask(req, res, pool));
  router.get('/statuses', (req, res) => taskController.getTaskStatuses(req, res, pool));
  router.patch('/:id/status', (req, res) => taskController.updateTaskStatus(req, res, pool));
  router.get('/priorities', (req, res) => taskController.getPriorities(req, res, pool));
  router.get('/active', (req, res) => taskController.getActiveTasks(req, res, pool));
  router.post('/:parentId/subtasks', (req, res) => taskController.createSubtask(req, res, pool));
  router.get('/:parentId/subtasks', (req, res) => taskController.getSubtasks(req, res, pool));


  // Task Type Routes
  router.get('/types', (req, res) => taskController.getTaskTypes(req, res, pool));
  router.get('/types/:id', (req, res) => taskController.getTaskTypeById(req, res, pool));
  router.post('/types', (req, res) => taskController.createTaskType(req, res, pool));
  router.put('/types/:id', (req, res) => taskController.updateTaskType(req, res, pool));
  router.delete('/types/:id', (req, res) => taskController.deleteTaskType(req, res, pool));

  return router;
}; 