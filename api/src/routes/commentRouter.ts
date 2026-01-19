import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import * as commentController from '../controllers/commentController';

// Comment routes
export default (pool: Pool): Router => {
  const router = Router();

  // Get task comments
  router.get('/', ((req, res) =>
    commentController.getTaskComments(req, res, pool)) as RequestHandler);

  // Create a comment
  router.post('/', ((req, res) =>
    commentController.createComment(req, res, pool)) as RequestHandler);

  // Edit a comment
  router.put('/:id', ((req, res) =>
    commentController.editComment(req, res, pool)) as RequestHandler);

  // Delete a comment
  router.delete('/:id', ((req, res) =>
    commentController.deleteComment(req, res, pool)) as RequestHandler);

  return router;
};
