import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types/error';
import logger from '../utils/logger';

// Postgres errors caused by the request rather than the server. The driver
// message names constraints and columns, so only a fixed message is returned.
const PG_ERRORS: Record<string, { status: number; error: string }> = {
  '23505': { status: 409, error: 'Resource already exists' },
  '23503': { status: 404, error: 'Referenced resource not found' },
  P0002: { status: 404, error: 'Resource not found' },
  '22023': { status: 400, error: 'Invalid request' },
  '22P02': { status: 400, error: 'Invalid request' },
  '23514': { status: 400, error: 'Invalid request' },
};

// multer rejects oversized files as LIMIT_FILE_SIZE; its other codes are
// malformed uploads (wrong field, too many parts).
const multerStatus = (err: CustomError): number | undefined =>
  err.name === 'MulterError'
    ? err.code === 'LIMIT_FILE_SIZE'
      ? 413
      : 400
    : undefined;

export default (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const pgError = err.code ? PG_ERRORS[err.code] : undefined;
  const status = pgError?.status ?? err.status ?? multerStatus(err) ?? 500;
  const context = { err, method: req.method, url: req.originalUrl };
  const logMessage = err.message || 'Unhandled error';

  if (status >= 500) {
    logger.error(context, logMessage);
  } else {
    logger.warn(context, logMessage);
  }

  if (pgError) {
    res.status(status).json({ error: pgError.error });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation Error',
      details: err.details,
    });
    return;
  }

  // Only messages attached to a deliberate 4xx are safe to echo back; a 500
  // carries whatever the driver said (constraint names, columns, hostnames).
  const isProduction = process.env.NODE_ENV === 'production';
  const message = err.message || 'Internal Server Error';
  const safeMessage =
    status < 500 ? message : isProduction ? 'Internal Server Error' : message;

  res.status(status).json({ error: safeMessage });
};
