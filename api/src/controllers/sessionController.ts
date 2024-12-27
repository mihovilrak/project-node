import { Request, Response } from 'express';
import { CustomRequest } from '../types/express';
import { SessionResponse } from '../types/session';

// Get session user
export const session = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (req.session?.user) {
      res.status(200).json({ user: req.session.user } as SessionResponse);
    } else {
      res.status(401).json({ message: 'Not authenticated' } as SessionResponse);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    } as SessionResponse);
  }
};
