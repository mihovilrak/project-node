import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import * as roleController from '../controllers/roleController';
import checkPermission from '../middleware/permissionMiddleware';

// Role routes
export default (pool: Pool): Router => {
  const router = Router();

  // Get roles
  router.get('/', ((req, res) =>
    roleController.getRoles(req, res, pool)) as RequestHandler);

  // Create role
  router.post('/', checkPermission(pool, 'Admin'), ((req, res) =>
    roleController.createRole(req, res, pool)) as RequestHandler);

  // Update role
  router.put('/:id', checkPermission(pool, 'Admin'), ((req, res) =>
    roleController.updateRole(req, res, pool)) as RequestHandler);

  return router;
};
