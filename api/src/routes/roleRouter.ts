import express, { Router } from 'express';
import { Pool } from 'pg';
import * as roleController from '../controllers/roleController';
import { checkPermission } from '../middleware/permissionMiddleware';

// Role routes
export default (pool: Pool): Router => {
  const router = express.Router();

  // Get roles
  router.get('/', (req, res) =>
    roleController.getRoles(req, res, pool));

  // Create role
  router.post('/', checkPermission(pool, 'Admin'), (req, res) =>
    roleController.createRole(req, res, pool));

  // Update role
  router.put('/:id', checkPermission(pool, 'Admin'), (req, res) =>
    roleController.updateRole(req, res, pool));

  return router;
};
