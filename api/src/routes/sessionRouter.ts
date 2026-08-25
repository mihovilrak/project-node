import { Router } from 'express';
import { Pool } from 'pg';
import * as sessionController from '../controllers/sessionController';
import { withPool } from '../utils/withPool';

// Session routes
export default (pool: Pool): Router => {
  const router = Router();

  // Get session (returns user + permissions)
  router.get('/', withPool(pool, sessionController.session));

  return router;
};
