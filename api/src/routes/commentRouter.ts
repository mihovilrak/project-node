import { Router } from 'express';
import { Pool } from 'pg';
import * as commentController from '../controllers/commentController';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();

  router.get('/', withPool(pool, commentController.getTaskComments));
  router.post('/', withPool(pool, commentController.createComment));
  router.put('/:id', withPool(pool, commentController.editComment));
  router.delete('/:id', withPool(pool, commentController.deleteComment));

  return router;
};
