import * as schedule from 'node-schedule';
import { pool } from './db';
import { server } from './server';
import { notificationService } from './services/notificationService';
import { logger } from './utils/logger';
import './jobs/cleanup';

const initializeService = async (): Promise<void> => {
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
const shutdown = async (signal: string): Promise<void> => {
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

initializeService().catch((error: Error) => {
  logger.error('Failed to start service:', error);
  process.exit(1);
});
