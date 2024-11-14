const schedule = require('node-schedule');
const config = require('./config');
const pool = require('./db');
const server = require('./server');
const notificationService = require('./services/notificationService');
const logger = require('./utils/logger');
const metrics = require('./metrics');
require('./jobs/cleanup');

const initializeService = async () => {
  try {
    await pool.query('SELECT 1');
    logger.info('Database connection established');

    // Schedule email processing
    schedule.scheduleJob('*/1 * * * *', async () => {
      await notificationService.processNewNotifications();
    });
    logger.info('Email processing scheduled');

  } catch (error) {
    logger.error('Service initialization failed:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  try {
    server.close();
    await pool.end();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

initializeService().catch((error) => {
  logger.error('Failed to start service:', error);
  process.exit(1);
});