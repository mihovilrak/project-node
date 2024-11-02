const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Task routes
module.exports = (pool) => {
  
  // Task routes

  // Get tasks
  router.get('/', (req, res) =>
    taskController.getTasks(req, res, pool));

  // Get task by ID
  router.get('/:id', (req, res) =>
    taskController.getTaskById(req, res, pool));

  // Create a new task
  router.post('/', (req, res) =>
    taskController.createTask(req, res, pool));

  // Update a task
  router.put('/:id', (req, res) =>
    taskController.updateTask(req, res, pool));

  // Delete a task
  router.delete('/:id', (req, res) =>
    taskController.deleteTask(req, res, pool));

  // Get task statuses
  router.get('/statuses', (req, res) =>
    taskController.getTaskStatuses(req, res, pool));

  // Update task status
  router.patch('/:id/status', (req, res) =>
    taskController.updateTaskStatus(req, res, pool));

  // Get priorities
  router.post('/:parentId/subtasks', (req, res) =>
    taskController.createSubtask(req, res, pool));

  // Get subtasks
  router.get('/:parentId/subtasks', (req, res) =>
    taskController.getSubtasks(req, res, pool));

    // Get tasks by assignee
  router.get('/assignee/:assignee_id', (req, res) =>
    taskController.getTaskByAssignee(req, res, pool));

  // Get tasks by holder
  router.get('/holder/:holder_id', (req, res) =>
    taskController.getTaskByHolder(req, res, pool));

  // Change task status (different from updateTaskStatus)
  router.patch('/:id/change-status', (req, res) =>
    taskController.changeTaskStatus(req, res, pool));

  // Get priorities
  router.get('/priorities', (req, res) =>
    taskController.getPriorities(req, res, pool));

  // Get active tasks
  router.get('/active/user', (req, res) =>
    taskController.getActiveTasks(req, res, pool));

  // Task Type Routes

  // Get task types
  router.get('/types', (req, res) =>
    taskController.getTaskTypes(req, res, pool));

  // Get task type by ID
  router.get('/types/:id', (req, res) =>
    taskController.getTaskTypeById(req, res, pool));

  // Create a new task type
  router.post('/types', (req, res) =>
    taskController.createTaskType(req, res, pool));

  // Update a task type
  router.put('/types/:id', (req, res) =>
    taskController.updateTaskType(req, res, pool));

  // Delete a task type
  router.delete('/types/:id', (req, res) =>
    taskController.deleteTaskType(req, res, pool));

  return router;
}; 