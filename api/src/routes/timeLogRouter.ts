import { Router } from 'express';
import { Pool } from 'pg';
import * as timeLogController from '../controllers/timeLogController';
import checkPermission from '../middleware/permissionMiddleware';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();

  router.get('/', checkPermission(pool, 'Admin'), withPool(pool, timeLogController.getAllTimeLogs));
  router.get('/tasks/:taskId/logs', withPool(pool, timeLogController.getTaskTimeLogs));
  router.get('/tasks/:taskId/spent-time', withPool(pool, timeLogController.getTaskSpentTime));
  router.get('/projects/:projectId/logs', withPool(pool, timeLogController.getProjectTimeLogs));
  router.get('/projects/:projectId/spent-time', withPool(pool, timeLogController.getProjectSpentTime));
  router.post('/tasks/:taskId/logs', withPool(pool, timeLogController.createTimeLog));
  router.get('/user/logs', withPool(pool, timeLogController.getUserTimeLogs));
  router.put('/:timeLogId', checkPermission(pool, 'Edit log'), withPool(pool, timeLogController.updateTimeLog));
  router.delete('/:timeLogId', checkPermission(pool, 'Delete log'), withPool(pool, timeLogController.deleteTimeLog));

  return router;
};
