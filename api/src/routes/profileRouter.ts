import { Router } from 'express';
import { Pool } from 'pg';
import * as profileController from '../controllers/profileController';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();

  router.get('/', withPool(pool, profileController.getProfile));
  router.put('/', withPool(pool, profileController.updateProfile));
  router.put('/password', withPool(pool, profileController.changePassword));
  router.get('/tasks', withPool(pool, profileController.getRecentTasks));
  router.get('/projects', withPool(pool, profileController.getRecentProjects));

  return router;
};
