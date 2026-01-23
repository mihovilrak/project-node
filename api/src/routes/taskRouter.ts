import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import checkPermission from '../middleware/permissionMiddleware';
import * as taskController from '../controllers/taskController';
import commentRouter from './commentRouter';
import fileRouter from './fileRouter';
import {
  getTaskTags,
  addTaskTags,
  removeTaskTag
} from '../controllers/tagController';
import * as timeLogController from '../controllers/timeLogController';
import * as watcherController from '../controllers/watcherController';

export default (pool: Pool): Router => {
  const router = Router();

  // Task routes
  router.get('/', ((req, res) =>
    taskController.getTasks(req, res, pool)) as RequestHandler);

  router.get('/statuses', ((req, res) =>
    taskController.getTaskStatuses(req, res, pool)) as RequestHandler);

  router.get('/priorities', ((req, res) =>
    taskController.getPriorities(req, res, pool)) as RequestHandler);

  router.get('/active', ((req, res) =>
    taskController.getActiveTasks(req, res, pool)) as RequestHandler);

  // Parameterized routes should come after specific routes
  router.get('/:id', ((req, res) =>
    taskController.getTaskById(req, res, pool)) as RequestHandler);

  router.post('/', checkPermission(pool, 'Create tasks'),
    ((req, res) => taskController.createTask(req, res, pool)) as RequestHandler);

  router.put('/:id', checkPermission(pool, 'Edit tasks'),
    ((req, res) => taskController.updateTask(req, res, pool)) as RequestHandler);

  router.delete('/:id', checkPermission(pool, 'Delete tasks'),
    ((req, res) => taskController.deleteTask(req, res, pool)) as RequestHandler);

  router.get('/:id/subtasks',
    ((req, res) => taskController.getSubtasks(req, res, pool)) as RequestHandler);

  // Comment routes
  router.use('/:id/comments', ((req, res, next) => {
    (req as any).taskId = req.params.id;
    next();
  }) as RequestHandler, commentRouter(pool));

  // File routes
  router.use('/:id/files', ((req, res, next) => {
    (req as any).taskId = req.params.id;
    next();
  }) as RequestHandler, fileRouter(pool));

  // Update task status
  router.patch('/:id', checkPermission(pool, 'Edit tasks'),
    ((req, res) => taskController.updateTask(req, res, pool)) as RequestHandler);

  // Change task status
  router.patch('/:id/change-status',
    ((req, res) => taskController.changeTaskStatus(req, res, pool)) as RequestHandler);

  // Tag routes
  router.get('/:id/tags', ((req, res) =>
    getTaskTags(req, res, pool)) as RequestHandler);

  router.post('/:id/tags', ((req, res) =>
    addTaskTags(req, res, pool)) as RequestHandler);

  router.delete('/:id/tags/:tagId', ((req, res) =>
    removeTaskTag(req, res, pool)) as RequestHandler);

  // Time log related routes
  router.get('/:id/time-logs', ((req, res) =>
    timeLogController.getTaskTimeLogs(req, res, pool)) as RequestHandler);

  router.get('/:id/spent-time', ((req, res) =>
    timeLogController.getTaskSpentTime(req, res, pool)) as RequestHandler);

  router.post('/:id/time-logs', ((req, res) =>
    timeLogController.createTimeLog(req, res, pool)) as RequestHandler);

  router.get('/:id/watchers', ((req, res) =>
    watcherController.getTaskWatchers(req, res, pool)) as RequestHandler);

  router.post('/:id/watchers', ((req, res) =>
    watcherController.addTaskWatcher(req, res, pool)) as RequestHandler);

  router.delete('/:id/watchers/:userId',
    ((req, res) => watcherController.removeTaskWatcher(req, res, pool)) as RequestHandler);

  return router;
}
