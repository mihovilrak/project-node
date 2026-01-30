import { Response } from 'express';
import { CustomRequest } from '../types/express';
import { SessionUser } from '../types/session';
import logger from '../utils/logger';

// Get session user
export const session = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.session.user) {
      res.status(200).json({ user: req.session.user });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};
