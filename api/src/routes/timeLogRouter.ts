import { Router } from 'express';
import { Pool } from 'pg';
import * as timeLogController from '../controllers/timeLogController';
import checkPermission from '../middleware/permissionMiddleware';
import {
  requireProjectAccess,
  requireTaskAccess,
  requireTimeLogOwnership,
} from '../middleware/projectAccessMiddleware';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();
  // Time logs are project data: reaching one means reaching its task's project.
  const taskAccess = requireTaskAccess(pool, 'taskId');
  const projectAccess = requireProjectAccess(pool, 'projectId');
  // Holding "Edit log" lets you edit your own hours, not somebody else's.
  const logOwnership = requireTimeLogOwnership(pool, 'timeLogId');

  router.get(
    '/',
    checkPermission(pool, 'Admin'),
    withPool(pool, timeLogController.getAllTimeLogs),
  );
  router.get(
    '/tasks/:taskId/logs',
    taskAccess,
    withPool(pool, timeLogController.getTaskTimeLogs),
  );
  router.get(
    '/tasks/:taskId/spent-time',
    taskAccess,
    withPool(pool, timeLogController.getTaskSpentTime),
  );
  router.get(
    '/projects/:projectId/logs',
    projectAccess,
    withPool(pool, timeLogController.getProjectTimeLogs),
  );
  router.get(
    '/projects/:projectId/spent-time',
    projectAccess,
    withPool(pool, timeLogController.getProjectSpentTime),
  );
  router.post(
    '/tasks/:taskId/logs',
    taskAccess,
    withPool(pool, timeLogController.createTimeLog),
  );
  router.get('/user/logs', withPool(pool, timeLogController.getUserTimeLogs));
  router.put(
    '/:timeLogId',
    checkPermission(pool, 'Edit log'),
    logOwnership,
    withPool(pool, timeLogController.updateTimeLog),
  );
  router.delete(
    '/:timeLogId',
    checkPermission(pool, 'Delete log'),
    logOwnership,
    withPool(pool, timeLogController.deleteTimeLog),
  );

  return router;
};
