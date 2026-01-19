import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import * as tagController from '../controllers/tagController';

// Tag routes
export default (pool: Pool): Router => {
  const router = Router();

  // Get all tags
  router.get('/', ((req, res) =>
    tagController.getTags(req, res, pool)) as RequestHandler);

  // Create tag
  router.post('/', ((req, res) =>
    tagController.createTag(req, res, pool)) as RequestHandler);

  // Update tag
  router.put('/:id', ((req, res) =>
    tagController.updateTag(req, res, pool)) as RequestHandler);

  // Delete tag
  router.delete('/:id', ((req, res) =>
    tagController.deleteTag(req, res, pool)) as RequestHandler);

  return router;
};
