import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import * as taskTypeController from '../controllers/taskTypeController';
import checkPermission from '../middleware/permissionMiddleware';
import { withPool } from '../utils/withPool';

export default (pool: Pool): Router => {
  const router = Router();

  router.get('/', withPool(pool, taskTypeController.getTaskTypes));
  router.get('/:id', withPool(pool, taskTypeController.getTaskTypeById));
  router.post('/', checkPermission(pool, 'Admin'), withPool(pool, taskTypeController.createTaskType));
  router.put('/:id', checkPermission(pool, 'Admin'), withPool(pool, taskTypeController.updateTaskType));
  router.delete('/:id', checkPermission(pool, 'Admin'), withPool(pool, taskTypeController.deleteTaskType));
  router.get('/icons', ((req, res) => taskTypeController.getAvailableIcons(req, res)) as RequestHandler);

  return router;
};
