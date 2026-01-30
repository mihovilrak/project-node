import { Router } from 'express';
import { Pool } from 'pg';
import * as tagController from '../controllers/tagController';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();

  router.get('/', withPool(pool, tagController.getTags));
  router.post('/', withPool(pool, tagController.createTag));
  router.put('/:id', withPool(pool, tagController.updateTag));
  router.delete('/:id', withPool(pool, tagController.deleteTag));

  return router;
};
