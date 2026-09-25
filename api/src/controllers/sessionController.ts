import { Response } from 'express';
import { Pool } from 'pg';
import { CustomRequest } from '../types/express';
import * as permissionModel from '../models/permissionModel';

// Get session user and permissions (single round-trip)
export const session = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  if (!req.session.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const permissions = await permissionModel.getUserPermissions(
    pool,
    String(req.session.user.id),
  );
  res.status(200).json({ user: req.session.user, permissions });
};
