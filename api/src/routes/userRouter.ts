import { Router } from 'express';
import { Pool } from 'pg';
import * as userController from '../controllers/userController';
import * as timeLogController from '../controllers/timeLogController';
import { withPool } from '../utils/withPool';

// User routes
export default (pool: Pool): Router => {
  const router = Router();

  router.get('/', withPool(pool, userController.getUsers));
  router.get('/statuses', withPool(pool, userController.getUserStatuses));
  router.get('/permissions', withPool(pool, userController.getUserPermissions));
  router.get('/time-logs', withPool(pool, timeLogController.getUserTimeLogs));
  router.get('/:id', withPool(pool, userController.getUserById));
  router.post('/', withPool(pool, userController.createUser));
  router.put('/:id', withPool(pool, userController.updateUser));
  router.patch('/:id/status', withPool(pool, userController.changeUserStatus));
  router.delete('/:id', withPool(pool, userController.deleteUser));

  return router;
};
