import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import * as timeLogController from '../controllers/timeLogController';
import checkPermission from '../middleware/permissionMiddleware';

export default (pool: Pool): Router => {
  const router = Router();

  // Get all time logs (admin only?)
  router.get('/', checkPermission(pool, 'Admin'), ((req, res) =>
    timeLogController.getAllTimeLogs(req, res, pool)) as RequestHandler);

  // Get task time logs
  router.get('/tasks/:taskId/logs', ((req, res) =>
    timeLogController.getTaskTimeLogs(req, res, pool)) as RequestHandler);

  // Get task spent time
  router.get('/tasks/:taskId/spent-time', ((req, res) =>
    timeLogController.getTaskSpentTime(req, res, pool)) as RequestHandler);

  // Get project time logs
  router.get('/projects/:projectId/logs', ((req, res) =>
    timeLogController.getProjectTimeLogs(req, res, pool)) as RequestHandler);

  // Get project spent time
  router.get('/projects/:projectId/spent-time', ((req, res) =>
    timeLogController.getProjectSpentTime(req, res, pool)) as RequestHandler);

  // Create time log for task
  router.post('/tasks/:taskId/logs', ((req, res) =>
    timeLogController.createTimeLog(req, res, pool)) as RequestHandler);

  // Get user time logs
  router.get('/user/logs', ((req, res) =>
    timeLogController.getUserTimeLogs(req, res, pool)) as RequestHandler);

  // Update time log
  router.put('/:timeLogId',
    checkPermission(pool, 'Edit log'),
    ((req, res) =>
    timeLogController.updateTimeLog(req, res, pool)) as RequestHandler);

  // Delete time log
  router.delete('/:timeLogId',
    checkPermission(pool, 'Delete log'),
    ((req, res) =>
    timeLogController.deleteTimeLog(req, res, pool)) as RequestHandler);

  return router;
};
