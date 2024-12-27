import express, { Router } from 'express';
import { Pool } from 'pg';
import * as activityTypeController from '../controllers/activityTypeController';
import checkPermission from '../middleware/permissionMiddleware';

export default (pool: Pool): Router => {
  const router = express.Router();

  // Get all activity types
  router.get('/', (req, res) => 
    activityTypeController.getActivityTypes(req, res, pool));

  // Create activity type
  router.post('/', checkPermission(pool, 'Admin'), (req, res) => 
    activityTypeController.createActivityType(req, res, pool));

  // Get available icons
  router.get('/icons', (req, res) => 
    activityTypeController.getAvailableIcons(req, res));

  // Update activity type
  router.put('/:id', checkPermission(pool, 'Admin'), (req, res) => 
    activityTypeController.updateActivityType(req, res, pool));

  // Delete activity type
  router.delete('/:id', checkPermission(pool, 'Admin'), (req, res) => 
    activityTypeController.deleteActivityType(req, res, pool));

  return router;
};
