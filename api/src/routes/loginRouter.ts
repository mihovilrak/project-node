import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import * as loginController from '../controllers/loginController';
import { PgRateLimitStore } from '../models/loginAttemptModel';
import { withPool } from '../utils/withPool';

// Login routes
export default (pool: Pool): Router => {
  const router = Router();
  const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // per IP per window
    message: { error: 'Too many login attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    store: new PgRateLimitStore(pool),
  });

  // Login (rate limited)
  router.post('/', loginRateLimiter, withPool(pool, loginController.login));

  return router;
};
