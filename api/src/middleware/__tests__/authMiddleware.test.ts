import { Response, NextFunction } from 'express';
import authMiddleware from '../authMiddleware';
import { CustomRequest } from '../../types/express';
import { Session } from 'express-session';

describe('AuthMiddleware', () => {
  let mockReq: Partial<CustomRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() when user is authenticated', async () => {
    const mockSession = {
      user: { id: '1', login: 'test', role_id: 1 }
    } as unknown as Session;
    mockReq.session = mockSession;

    await authMiddleware(mockReq as CustomRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 401 when no session exists', async () => {
    mockReq.session = undefined as any;

    await authMiddleware(mockReq as CustomRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when session has no user', async () => {
    const mockSession = {} as unknown as Session;
    mockReq.session = mockSession;

    await authMiddleware(mockReq as CustomRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
