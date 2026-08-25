import rateLimit from 'express-rate-limit';

const raw = process.env.NOTIFICATION_RATE_LIMIT || '100';
const parsed = parseInt(raw, 10);
const max = Number.isNaN(parsed) || parsed <= 0 ? 100 : parsed;

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max,
  message: 'Too many notifications created from this IP'
});
