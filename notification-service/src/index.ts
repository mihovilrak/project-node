import * as schedule from 'node-schedule';
import { config, validateConfig } from './config';
import { pool } from './db';
import { server } from './server';
import { notificationService } from './services/notificationService';
import { logger } from './utils/logger';
import './jobs/cleanup';

const initializeService = async (): Promise<void> => {
  try {
    if (config.app.nodeEnv !== 'test') {
      validateConfig();
    }
    await pool.query('SELECT 1');
    logger.info('Database connection established');

    // Schedule email processing
    schedule.scheduleJob('*/1 * * * *', async () => {
      await notificationService.processNewNotifications();
    });
    logger.info('Email processing scheduled');

  } catch (error) {
    logger.error({ err: error }, 'Service initialization failed');
    process.exit(1);
  }
};

// Handle graceful shutdown (single place; wait for server.close then pool.end)
const shutdown = (signal: string): void => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Error closing server');
      process.exit(1);
    }
    logger.info('Server closed');
    pool.end().then(() => {
      process.exit(0);
    }).catch((error) => {
      logger.error({ err: error }, 'Error closing pool');
      process.exit(1);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

initializeService().catch((error: Error) => {
  logger.error({ err: error }, 'Failed to start service');
  process.exit(1);
});
