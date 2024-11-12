const rateLimit = require('express-rate-limit');

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.NOTIFICATION_RATE_LIMIT) || 100,
  message: 'Too many notifications created from this IP'
});

module.exports = emailLimiter;