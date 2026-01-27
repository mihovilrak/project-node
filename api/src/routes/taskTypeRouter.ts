import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import * as taskTypeController from '../controllers/taskTypeController';
import checkPermission from '../middleware/permissionMiddleware';

export default (pool: Pool): Router => {
  const router = Router();

  // Get all task types
  router.get('/', (req, res) =>
    taskTypeController.getTaskTypes(req, res, pool));

  // Get task type by ID
  router.get('/:id', ((req, res) =>
    taskTypeController.getTaskTypeById(req, res, pool)) as RequestHandler);

  // Create task type
  router.post('/', checkPermission(pool, 'Admin'), ((req, res) =>
    taskTypeController.createTaskType(req, res, pool)) as RequestHandler);

  // Update task type
  router.put('/:id', checkPermission(pool, 'Admin'), ((req, res) =>
    taskTypeController.updateTaskType(req, res, pool)) as RequestHandler);

  // Delete task type
  router.delete('/:id', checkPermission(pool, 'Admin'), ((req, res) =>
    taskTypeController.deleteTaskType(req, res, pool)) as RequestHandler);

  // Get available icons
  router.get('/icons', ((req, res) =>
    taskTypeController.getAvailableIcons(req, res)) as RequestHandler);

  return router;
};
