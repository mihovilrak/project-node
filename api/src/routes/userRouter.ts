import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import * as userController from '../controllers/userController';
import * as timeLogController from '../controllers/timeLogController';

// User routes
export default (pool: Pool): Router => {
  const router = Router();

  // Get all users with optional filters
  router.get('/', ((req, res) =>
    userController.getUsers(req, res, pool)) as RequestHandler);

  // Get user permissions
  router.get('/permissions', ((req, res) =>
    userController.getUserPermissions(req, res, pool)) as RequestHandler);

  // Get user by ID
  router.get('/:id', ((req, res) =>
    userController.getUserById(req, res, pool)) as RequestHandler);

  // Create a new user
  router.post('/', ((req, res) =>
    userController.createUser(req, res, pool)) as RequestHandler);

  // Edit a user
  router.put('/:id', ((req, res) =>
    userController.updateUser(req, res, pool)) as RequestHandler);

  // Change user status
  router.patch('/:id/status', ((req, res) =>
    userController.changeUserStatus(req, res, pool)) as RequestHandler);

  // Delete a user
  router.delete('/:id', ((req, res) =>
    userController.deleteUser(req, res, pool)) as RequestHandler);

  // Time log related routes
  router.get('/time-logs', ((req, res) =>
    timeLogController.getUserTimeLogs(req, res, pool)) as RequestHandler);

  return router;
};
