import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.NOTIFICATION_RATE_LIMIT || '100'),
  message: 'Too many notifications created from this IP'
});
