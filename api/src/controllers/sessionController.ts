import { Response } from 'express';
import { CustomRequest } from '../types/express';
import { SessionUser } from '../types/session';

// Get session user
export const session = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.session?.user) {
      const sessionUser: SessionUser = {
        id: req.session.user.id,
        login: req.session.user.login,
        role_id: req.session.user.role_id
      };
      res.status(200).json({ user: sessionUser });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};
