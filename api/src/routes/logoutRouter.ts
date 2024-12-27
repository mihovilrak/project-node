import express, { Router } from 'express';
import { logout } from '../controllers/loginController';

export default (): Router => {
  const router = express.Router();

  // Logout
  router.post('/', (req, res) =>
    logout(req, res));

  return router;
};