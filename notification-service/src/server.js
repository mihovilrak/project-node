const express = require('express');
const emailService = require('./services/emailService');
const pool = require('./db');
const config = require('./config');
const rateLimiter = require('./middleware/rateLimiter');
const notificationRoutes = require('./routes/notifications');
const metrics = require('./metrics');
const logger = require('./utils/logger');

const app = express();

app.use(express.json());
app.use('/api/notifications', rateLimiter, notificationRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    await emailService.transporter.verify();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      email: 'connected',
      metrics: {
        notificationsSent: metrics.notificationsSent,
        emailErrors: metrics.emailErrors,
        lastProcessingTime: metrics.lastProcessingTime
      },
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = config.app.port || 5001;
const server = app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = server;