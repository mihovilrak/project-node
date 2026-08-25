import { Router } from 'express';
import { Pool } from 'pg';
import * as taskTypeRouter from './taskTypeRouter';
import * as activityTypeRouter from './activityTypeRouter';
import * as adminController from '../controllers/adminController';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();

  router.use('/task-types', (req, res, next) => next(), taskTypeRouter.default(pool));
  router.use('/activity-types', (req, res, next) => next(), activityTypeRouter.default(pool));
  router.get('/permissions', withPool(pool, adminController.getAllPermissions));

  return router;
};
