import { Request, Response, NextFunction } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// A custom header forces a CORS preflight, which only FE_URL passes, so a
// cross-site form or fetch cannot send a state-changing request with it.
export default (req: Request, res: Response, next: NextFunction): void => {
  if (
    SAFE_METHODS.has(req.method) ||
    req.get('X-Requested-With') === 'XMLHttpRequest'
  ) {
    next();
    return;
  }
  res.status(403).json({ error: 'Missing CSRF header' });
};
