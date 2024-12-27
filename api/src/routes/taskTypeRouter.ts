import express, { Router } from 'express';
import { Pool } from 'pg';
import * as taskTypeController from '../controllers/taskTypeController';
import checkPermission from '../middleware/permissionMiddleware';

export default (pool: Pool): Router => {
  const router = express.Router();

  // Get all task types
  router.get('/', (req, res) =>
    taskTypeController.getTaskTypes(req, res, pool));

  // Get task type by ID
  router.get('/:id', (req, res) =>
    taskTypeController.getTaskTypeById(req, res, pool));

  // Create task type
  router.post('/', checkPermission(pool, 'Admin'), (req, res) =>
    taskTypeController.createTaskType(req, res, pool));

  // Update task type
  router.put('/:id', checkPermission(pool, 'Admin'), (req, res) =>
    taskTypeController.updateTaskType(req, res, pool));

  // Delete task type
  router.delete('/:id', checkPermission(pool, 'Admin'), (req, res) =>
    taskTypeController.deleteTaskType(req, res, pool));

  return router;
};
