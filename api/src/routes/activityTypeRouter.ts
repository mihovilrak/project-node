import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import * as activityTypeController from '../controllers/activityTypeController';
import checkPermission from '../middleware/permissionMiddleware';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();

  router.get('/', withPool(pool, activityTypeController.getActivityTypes));
  router.post('/', checkPermission(pool, 'Admin'), withPool(pool, activityTypeController.createActivityType));
  router.get('/icons', ((req, res) => activityTypeController.getAvailableIcons(req, res)) as RequestHandler);
  router.put('/:id', checkPermission(pool, 'Admin'), withPool(pool, activityTypeController.updateActivityType));
  router.delete('/:id', checkPermission(pool, 'Admin'), withPool(pool, activityTypeController.deleteActivityType));

  return router;
};
