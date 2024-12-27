import express, { Router } from 'express';
import { Pool } from 'pg';
import * as profileController from '../controllers/profileController';

export default (pool: Pool): Router => {
  const router = express.Router();

  // Get user profile
  router.get('/', (req, res) => 
    profileController.getProfile(req, res, pool));

  // Update user profile
  router.put('/', (req, res) => 
    profileController.updateProfile(req, res, pool));

  // Change password
  router.put('/password', (req, res) => 
    profileController.changePassword(req, res, pool));

  // Get recent tasks
  router.get('/tasks', (req, res) => 
    profileController.getRecentTasks(req, res, pool));

  // Get recent projects
  router.get('/projects', (req, res) => 
    profileController.getRecentProjects(req, res, pool));

  return router;
};
