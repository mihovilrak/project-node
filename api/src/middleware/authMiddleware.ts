import { Response, NextFunction } from 'express';
import { CustomRequest } from '../types/express';

export default async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Check if the user is authenticated
  if (req.session && req.session.user) {
    console.log('Auth check - User found:', req.session.user);
    next();
  } else {
    console.log('Auth check - No session or user found');
    res.status(403).json({ error: 'Access denied' });
  }
}
