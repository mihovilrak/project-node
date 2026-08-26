import { Router } from 'express';
import { Pool } from 'pg';
import * as tagController from '../controllers/tagController';
import checkPermission from '../middleware/permissionMiddleware';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();
  // Tags are global reference data shared by every project, so only an
  // administrator may add, rename or retire one. Reading stays open.
  const admin = checkPermission(pool, 'Admin');

  router.get('/', withPool(pool, tagController.getTags));
  router.post('/', admin, withPool(pool, tagController.createTag));
  router.put('/:id', admin, withPool(pool, tagController.updateTag));
  router.delete('/:id', admin, withPool(pool, tagController.deleteTag));

  return router;
};
