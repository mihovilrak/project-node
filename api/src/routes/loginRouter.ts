import express, { Router } from 'express';
import { Pool } from 'pg';
import * as loginController from '../controllers/loginController';

// Login routes
export default (pool: Pool): Router => {  
  const router = express.Router();

  // Login
  router.post('/', (req, res) =>
    loginController.login(req, res, pool));

  return router;
};
