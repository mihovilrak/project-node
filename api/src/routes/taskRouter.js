const express = require('express');
const { checkPermission } = require('../middleware/permissionMiddleware');
const taskController = require('../controllers/taskController');
const commentRouter = require('./commentRouter');
const fileRouter = require('./fileRouter');
const { getTaskTags, addTaskTags, removeTaskTag } = require('./../controllers/tagController');
const timeLogController = require('../controllers/timeLogController');
const router = express.Router();

// Task routes
module.exports = (pool) => {
  
  // Get all tasks
  router.get('/', (req, res) =>
    taskController.getTasks(req, res, pool));

  // Get task statuses
  router.get('/statuses', (req, res) =>
    taskController.getTaskStatuses(req, res, pool));

  // Get priorities
  router.get('/priorities', (req, res) =>
    taskController.getPriorities(req, res, pool));

  // Get active tasks
  router.get('/active', (req, res) =>
    taskController.getActiveTasks(req, res, pool));

  // Get task by assignee
  router.get('/?assignee=:assignee_id', (req, res) =>
    taskController.getTaskByAssignee(req, res, pool));

  // Get task by holder
  router.get('/?holder=:holder_id', (req, res) =>
    taskController.getTaskByHolder(req, res, pool));

  // Parameterized routes should come after specific routes
  router.get('/:id', (req, res) =>
    taskController.getTaskById(req, res, pool));

  // Create a new task
  router.post('/', checkPermission(pool, 'Create tasks'), (req, res) =>
    taskController.createTask(req, res, pool));

  // Update a task
  router.put('/:id', checkPermission(pool, 'Edit tasks'), (req, res) =>
    taskController.updateTask(req, res, pool));

  // Delete a task
  router.delete('/:id', checkPermission(pool, 'Delete tasks'), (req, res) =>
    taskController.deleteTask(req, res, pool));

  // Get subtasks
  router.get('/:id/subtasks', (req, res) =>
    taskController.getSubtasks(req, res, pool));

  // Comment routes
  router.use('/:id/comments', (req, res, next) => {
    req.taskId = req.params.id;
    next();
  }, commentRouter(pool));

  // File routes
  router.use('/:id/files', (req, res, next) => {
    req.taskId = req.params.id;
    next();
  }, fileRouter(pool));

  // Update task status
  router.patch('/:id/status', checkPermission(pool, 'Edit tasks'), (req, res) =>
    taskController.updateTaskStatus(req, res, pool));

  // Change task status
  router.patch('/:id/change-status', (req, res) =>
    taskController.changeTaskStatus(req, res, pool));

  // Tag routes
  router.get('/:id/tags', (req, res) =>
    getTaskTags(req, res, pool));

  // Add tags to task
  router.post('/:id/tags', (req, res) =>
    addTaskTags(req, res, pool));

  // Remove tag from task
  router.delete('/:id/tags/:tagId', (req, res) =>
    removeTaskTag(req, res, pool));

  // Time log related routes
  router.get('/:id/time-logs', (req, res) =>
    timeLogController.getTaskTimeLogs(req, res, pool));

  router.get('/:id/spent-time', (req, res) =>
    timeLogController.getTaskSpentTime(req, res, pool));

  router.post('/:id/time-logs', (req, res) =>
    timeLogController.createTimeLog(req, res, pool));

  return router;
}; 