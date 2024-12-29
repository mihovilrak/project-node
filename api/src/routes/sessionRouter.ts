import { Router } from 'express';
import * as sessionController from '../controllers/sessionController';

// Session routes
export default (): Router => {
  const router = Router();

  // Get session
  router.get('/', (req, res) =>
    sessionController.session(req, res));

  return router;
};
