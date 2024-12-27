import express, { Router } from 'express';
import { Pool } from 'pg';
import * as taskTypeRouter from './taskTypeRouter';
import * as activityTypeRouter from './activityTypeRouter';
import * as adminController from '../controllers/adminController';

export default (pool: Pool): Router => {
  const router = express.Router();

  // Mount task types routes under /admin/task-types
  router.use('/task-types', (req, res, next) => {
    next();
  }, taskTypeRouter.default(pool));

  // Mount activity types routes under /admin/activity-types
  router.use('/activity-types', (req, res, next) => {
    next();
  }, activityTypeRouter.default(pool));

  // Get all permissions
  router.get('/permissions', (req, res) => {
    adminController.getAllPermissions(req, res, pool);
  });

  return router;
};
