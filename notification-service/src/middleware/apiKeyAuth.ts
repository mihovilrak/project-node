import { Request, Response, NextFunction } from 'express';

const API_KEY = process.env.NOTIFICATION_API_KEY;

export function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!API_KEY) {
    next();
    return;
  }
  const key = req.headers['x-api-key'] ?? (req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined);
  if (key !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
