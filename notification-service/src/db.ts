import { config } from './config';
import { logger } from './utils/logger';
import { createPool } from '@pm/backend-common';

// One connection is held for the whole delivery pass by the advisory lock.
const pool = createPool(config.db, logger, { max: 3 });

export { pool };
