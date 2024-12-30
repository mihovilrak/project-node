import * as schedule from 'node-schedule';
import { pool } from '../db';
import { logger } from '../utils/logger';

const cleanupOldNotifications = async (): Promise<void> => {
  try {
    const result = await pool.query(
      `UPDATE notifications 
       SET active = false 
       WHERE created_on < NOW() - INTERVAL '30 days'
       AND is_read = true`
    );
    logger.info(`Cleaned up ${result.rowCount} old notifications`);
  } catch (error) {
    logger.error('Error cleaning up notifications:', error);
  }
};

// Run cleanup job daily at 2 AM
schedule.scheduleJob('0 2 * * *', cleanupOldNotifications);
