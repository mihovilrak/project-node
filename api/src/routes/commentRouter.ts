import { Router } from 'express';
import { Pool } from 'pg';
import * as commentController from '../controllers/commentController';
import { requireCommentOwnership } from '../middleware/projectAccessMiddleware';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();
  const commentOwnership = requireCommentOwnership(pool);

  router.get('/', withPool(pool, commentController.getTaskComments));
  router.post('/', withPool(pool, commentController.createComment));
  router.put(
    '/:id',
    commentOwnership,
    withPool(pool, commentController.editComment),
  );
  router.delete(
    '/:id',
    commentOwnership,
    withPool(pool, commentController.deleteComment),
  );

  return router;
};
