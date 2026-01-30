import { Router } from 'express';
import { Pool } from 'pg';
import * as roleController from '../controllers/roleController';
import checkPermission from '../middleware/permissionMiddleware';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();

  router.get('/', withPool(pool, roleController.getRoles));
  router.post('/', checkPermission(pool, 'Admin'), withPool(pool, roleController.createRole));
  router.put('/:id', checkPermission(pool, 'Admin'), withPool(pool, roleController.updateRole));

  return router;
};
