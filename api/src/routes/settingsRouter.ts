import express, { Router } from 'express';
import { Pool } from 'pg';
import checkPermission from '../middleware/permissionMiddleware';
import * as settingsController from '../controllers/settingsController';

export default (pool: Pool): Router => {
  const router = express.Router();

  router.get('/app_settings', 
    checkPermission(pool, 'Admin'), 
    (req, res) => settingsController.getSystemSettings(req, res, pool)
  );

  router.put('/app_settings', 
    checkPermission(pool, 'Admin'), 
    (req, res) => settingsController.updateSystemSettings(req, res, pool)
  );

  router.get('/user_settings', 
    (req, res) => settingsController.getUserSettings(req, res, pool)
  );

  router.put('/user_settings', 
    (req, res) => settingsController.updateUserSettings(req, res, pool)
  );

  return router;
};
