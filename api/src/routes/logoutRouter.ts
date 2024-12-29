import { Router } from 'express';
import { logout } from '../controllers/loginController';

export default (): Router => {
  const router = Router();

  // Logout
  router.post('/', (req, res) =>
    logout(req, res));

  return router;
};