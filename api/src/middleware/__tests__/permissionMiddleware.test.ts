import { Response, NextFunction } from 'express';
import { Pool } from 'pg';
import permissionMiddleware from '../permissionMiddleware';
import { CustomRequest } from '../../types/express';
import { Permission } from '../../types/permission';
import * as permissionModel from '../../models/permissionModel';
import { Session } from 'express-session';

jest.mock('../../models/permissionModel');

describe('PermissionMiddleware', () => {
  let mockReq: Partial<CustomRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockPool: Partial<Pool>;
  const testPermission: Permission = 'Create projects';
  const deletePermission: Permission = 'Delete projects';

  beforeEach(() => {
    const mockSession = {
      user: { id: '1', login: 'test', role_id: 1 }
    } as unknown as Session;

    mockReq = {
      session: mockSession
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    mockPool = {};
    jest.clearAllMocks();
  });

  it('should call next() when user has permission', async () => {
    (permissionModel.hasPermission as jest.Mock).mockResolvedValue(true);
    const middleware = permissionMiddleware(mockPool as Pool, testPermission);

    await middleware(mockReq as CustomRequest, mockRes as Response, mockNext);

    expect(permissionModel.hasPermission).toHaveBeenCalledWith(mockPool, '1', testPermission);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 403 when user does not have permission', async () => {
    (permissionModel.hasPermission as jest.Mock).mockResolvedValue(false);
    const middleware = permissionMiddleware(mockPool as Pool, deletePermission);

    await middleware(mockReq as CustomRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: `Permission denied: ${deletePermission} required`
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when user is not authenticated', async () => {
    mockReq.session = { user: undefined } as any;
    const middleware = permissionMiddleware(mockPool as Pool, testPermission);

    await middleware(mockReq as CustomRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next(error) when permission check fails', async () => {
    const dbError = new Error('Database error');
    (permissionModel.hasPermission as jest.Mock).mockRejectedValue(dbError);
    const middleware = permissionMiddleware(mockPool as Pool, testPermission);

    await middleware(mockReq as CustomRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(dbError);
    expect(mockRes.status).not.toHaveBeenCalled();
  });
});
