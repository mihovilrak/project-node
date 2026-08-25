import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import * as loginController from '../controllers/loginController';
import { withPool } from '../utils/withPool';

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max requests per window per IP
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login routes
export default (pool: Pool): Router => {
  const router = Router();

  // Login (rate limited)
  router.post('/', loginRateLimiter, withPool(pool, loginController.login));

  return router;
};
