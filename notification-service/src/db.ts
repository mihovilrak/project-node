import { config } from './config';
import { logger } from './utils/logger';
import { createPool } from '@pm/backend-common';

const pool = createPool(config.db, logger);

export { pool };
