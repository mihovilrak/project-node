import { Router } from 'express';
import { Pool } from 'pg';
import * as userController from '../controllers/userController';
import checkPermission from '../middleware/permissionMiddleware';
import { withPool } from '../utils/withPool';

// User routes
export default (pool: Pool): Router => {
  const router = Router();

  router.get('/', withPool(pool, userController.getUsers));
  router.get('/statuses', withPool(pool, userController.getUserStatuses));
  router.get('/permissions', withPool(pool, userController.getUserPermissions));
  router.get('/:id', withPool(pool, userController.getUserById));
  router.post(
    '/',
    checkPermission(pool, 'Admin'),
    withPool(pool, userController.createUser),
  );
  router.put(
    '/:id',
    checkPermission(pool, 'Admin'),
    withPool(pool, userController.updateUser),
  );
  router.patch(
    '/:id/status',
    checkPermission(pool, 'Admin'),
    withPool(pool, userController.changeUserStatus),
  );
  router.delete(
    '/:id',
    checkPermission(pool, 'Admin'),
    withPool(pool, userController.deleteUser),
  );

  return router;
};
