import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types/error';
import logger from '../utils/logger';

export default async (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  logger.error({ err }, err.message ?? 'Unhandled error');

  // Default error status and message
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation Error',
      details: err.details,
    });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token or no token provided',
    });
    return;
  }

  // Only messages attached to a deliberate 4xx are safe to echo back; a 500
  // carries whatever the driver said (constraint names, columns, hostnames).
  const isProduction = process.env.NODE_ENV === 'production';
  const safeMessage =
    status < 500 ? message : isProduction ? 'Internal Server Error' : message;

  res.status(status).json({
    error: safeMessage,
    ...(!isProduction && { stack: err.stack }),
  });
};
