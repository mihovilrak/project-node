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
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();

  router.get('/', withPool(pool, taskController.getTasks));
  router.get('/statuses', withPool(pool, taskController.getTaskStatuses));
  router.get('/priorities', withPool(pool, taskController.getPriorities));
  router.get('/active', withPool(pool, taskController.getActiveTasks));
  router.get('/:id', withPool(pool, taskController.getTaskById));
  router.post('/', checkPermission(pool, 'Create tasks'), withPool(pool, taskController.createTask));
  router.put('/:id', checkPermission(pool, 'Edit tasks'), withPool(pool, taskController.updateTask));
  router.delete('/:id', checkPermission(pool, 'Delete tasks'), withPool(pool, taskController.deleteTask));
  router.get('/:id/subtasks', withPool(pool, taskController.getSubtasks));

  router.use('/:id/comments', ((req, res, next) => {
    (req as any).taskId = req.params.id;
    next();
  }) as RequestHandler, commentRouter(pool));

  router.use('/:id/files', ((req, res, next) => {
    (req as any).taskId = req.params.id;
    next();
  }) as RequestHandler, fileRouter(pool));

  router.patch('/:id', checkPermission(pool, 'Edit tasks'), withPool(pool, taskController.updateTask));
  router.patch('/:id/change-status', withPool(pool, taskController.changeTaskStatus));
  router.get('/:id/tags', withPool(pool, getTaskTags));
  router.post('/:id/tags', withPool(pool, addTaskTags));
  router.delete('/:id/tags/:tagId', withPool(pool, removeTaskTag));
  router.get('/:id/time-logs', withPool(pool, timeLogController.getTaskTimeLogs));
  router.get('/:id/spent-time', withPool(pool, timeLogController.getTaskSpentTime));
  router.post('/:id/time-logs', withPool(pool, timeLogController.createTimeLog));
  router.get('/:id/watchers', withPool(pool, watcherController.getTaskWatchers));
  router.post('/:id/watchers', withPool(pool, watcherController.addTaskWatcher));
  router.delete('/:id/watchers/:userId', withPool(pool, watcherController.removeTaskWatcher));

  return router;
}
