import { Pool } from 'pg';
import { applyLogLevel } from '@pm/backend-common';
import { getSystemSettings } from '../models/settingsModel';
import logger from './logger';

// Replace the LOG_LEVEL startup default with the level stored in app_settings.
export const applyStoredLogLevel = async (pool: Pool): Promise<void> => {
  try {
    const settings = await getSystemSettings(pool);
    applyLogLevel(logger, settings?.log_level);
  } catch (err) {
    logger.warn(
      { err },
      'Could not read log_level from app_settings; keeping LOG_LEVEL',
    );
  }
};

export const setLogLevel = (level: unknown): boolean =>
  applyLogLevel(logger, level);
