import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'crypto';

const getApiKey = (): string | undefined => process.env.NOTIFICATION_API_KEY;

const safeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
};

export function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const apiKey = getApiKey();
  if (!apiKey) {
    res.status(503).json({ error: 'Service misconfigured' });
    return;
  }
  const header = req.headers['x-api-key'];
  const key =
    (typeof header === 'string' ? header : undefined) ??
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined);
  if (!key || !safeEqual(key, apiKey)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
