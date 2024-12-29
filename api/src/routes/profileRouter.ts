import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import * as profileController from '../controllers/profileController';

export default (pool: Pool): Router => {
  const router = Router();

  // Get user profile
  router.get('/', ((req, res) => 
    profileController.getProfile(req, res, pool)) as RequestHandler);

  // Update user profile
  router.put('/', ((req, res) => 
    profileController.updateProfile(req, res, pool)) as RequestHandler);

  // Change password
  router.put('/password', ((req, res) => 
    profileController.changePassword(req, res, pool)) as RequestHandler);

  // Get recent tasks
  router.get('/tasks', ((req, res) => 
    profileController.getRecentTasks(req, res, pool)) as RequestHandler);

  // Get recent projects
  router.get('/projects', ((req, res) => 
    profileController.getRecentProjects(req, res, pool)) as RequestHandler);

  return router;
};
