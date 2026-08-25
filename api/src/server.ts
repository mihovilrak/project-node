import app from './app';
import config from './config';
import { ensureConnection } from './db';
import logger from './utils/logger';

ensureConnection()
  .then(() => {
    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  })
  .catch((err) => {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  });
