import { Response, NextFunction } from 'express';
import { CustomRequest } from '../types/express';

export default async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Check if the user is authenticated
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Access denied' });
  }
}
