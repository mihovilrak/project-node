import express, { Router } from 'express';
import { DatabasePool } from '../types/models';
import { checkPermission } from '../middleware/permissionMiddleware';
import * as taskController from '../controllers/taskController';
import * as commentRouter from './commentRouter';
import * as fileRouter from './fileRouter';
import {
  getTaskTags,
  addTaskTags,
  removeTaskTag
} from '../controllers/tagController';
import * as timeLogController from '../controllers/timeLogController';

export function taskRouter(pool: DatabasePool): Router {
  const router = express.Router();
  
  // Task routes
  router.get('/', (req, res) =>
    taskController.getTasks(req, res, pool));

  router.get('/statuses', (req, res) =>
    taskController.getTaskStatuses(req, res, pool));

  router.get('/priorities', (req, res) =>
    taskController.getPriorities(req, res, pool));

  router.get('/active', (req, res) =>
    taskController.getActiveTasks(req, res, pool));

  router.get('/?assignee=:assignee_id', (req, res) =>
    taskController.getTaskByAssignee(req, res, pool));

  router.get('/?holder=:holder_id', (req, res) =>
    taskController.getTaskByHolder(req, res, pool));

  // Parameterized routes should come after specific routes
  router.get('/:id', (req, res) =>
    taskController.getTaskById(req, res, pool));

  router.post('/', checkPermission(pool, 'Create tasks'), (req, res) =>
    taskController.createTask(req, res, pool));

  router.put('/:id', checkPermission(pool, 'Edit tasks'), (req, res) =>
    taskController.updateTask(req, res, pool));

  router.delete('/:id', checkPermission(pool, 'Delete tasks'), (req, res) =>
    taskController.deleteTask(req, res, pool));

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
    taskController.updateTask(req, res, pool));

  // Change task status
  router.patch('/:id/change-status', (req, res) =>
    taskController.changeTaskStatus(req, res, pool));

  // Tag routes
  router.get('/:id/tags', (req, res) =>
    getTaskTags(req, res, pool));

  router.post('/:id/tags', (req, res) =>
    addTaskTags(req, res, pool));

  router.delete('/:id/tags/:tagId', (req, res) =>
    removeTaskTag(req, res, pool));

  // Time log related routes
  router.get('/:id/time-logs', (req, res) =>
    timeLogController.getTaskTimeLogs(req, res, pool));

  router.get('/:id/spent-time', (req, res) =>
    timeLogController.getTaskSpentTime(req, res, pool));

  router.post('/:id/time-logs', (req, res) =>
    timeLogController.createTimeLog(req, res, pool));

  router.get('/:id/watchers', (req, res) =>
    taskController.getTaskWatchers(req, res, pool));

  router.post('/:id/watchers', (req, res) =>
    taskController.addTaskWatcher(req, res, pool));

  router.delete('/:id/watchers/:userId', (req, res) =>
    taskController.removeTaskWatcher(req, res, pool));

  return router;
}
