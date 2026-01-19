import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';
import * as loginController from '../controllers/loginController';

// Login routes
export default (pool: Pool): Router => {
  const router = Router();

  // Login
  router.post('/', ((req, res) =>
    loginController.login(req, res, pool)) as RequestHandler);

  return router;
};
