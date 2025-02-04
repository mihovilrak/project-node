import { Request, Response } from 'express';
import { Session } from 'express-session';
import { Pool } from 'pg';
import * as adminModel from '../../models/adminModel';
import * as adminController from '../adminController';
import { CustomRequest } from '../../types/express';
import { SystemLogQuery, SystemStats, SystemLog, Permission } from '../../types/admin';
import { ParsedQs } from 'qs';

// Mock the models
jest.mock('../../models/adminModel');

describe('AdminController', () => {
  let mockReq: Partial<Request & CustomRequest>;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;

  beforeEach(() => {
    // Create a partial mock Session object with required properties
    const mockSession = {
      id: 'test-session-id',
      cookie: {
        originalMaxAge: null,
        expires: undefined,
        secure: false,
        httpOnly: true,
        path: '/',
        domain: undefined,
        sameSite: 'strict'
      },
      regenerate: (callback: (err: any) => void) => callback(null),
      destroy: (callback: (err: any) => void) => callback(null),
      reload: (callback: (err: any) => void) => callback(null),
      resetMaxAge: () => {},
      touch: (callback: (err: any) => void) => callback(null),
      save: (callback: (err: any) => void) => callback(null),
      user: {
        id: '1',
        login: 'test',
        role_id: 1
      }
    } as Session & Partial<{ user: { id: string; login: string; role_id: number } }>;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockReq = {
      params: {},
      query: {},
      body: {},
      session: mockSession
    };

    mockPool = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAdminAccess', () => {
    it('should return true when user is admin', async () => {
      (adminModel.isUserAdmin as jest.Mock).mockResolvedValue(true);

      const result = await adminController.checkAdminAccess(
        mockReq as CustomRequest,
        mockRes as Response,
        mockPool as Pool
      );

      expect(result).toBe(true);
      expect(adminModel.isUserAdmin).toHaveBeenCalledWith(mockPool, '1');
    });

    it('should return 401 when user is not authenticated', async () => {
      mockReq.session!.user = undefined;

      const result = await adminController.checkAdminAccess(
        mockReq as CustomRequest,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
      expect(result).toEqual(expect.any(Object));
    });

    it('should return 403 when user is not admin', async () => {
      (adminModel.isUserAdmin as jest.Mock).mockResolvedValue(false);

      const result = await adminController.checkAdminAccess(
        mockReq as CustomRequest,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied' });
      expect(result).toEqual(expect.any(Object));
    });

    it('should handle errors appropriately', async () => {
      (adminModel.isUserAdmin as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await adminController.checkAdminAccess(
        mockReq as CustomRequest,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(result).toBe(false);
    });
  });

  describe('getSystemStats', () => {
    const mockStats: SystemStats = {
      total_users: 10,
      total_projects: 5,
      total_tasks: 20,
      total_time_logged: 1000
    };

    it('should return system stats successfully', async () => {
      (adminModel.getSystemStats as jest.Mock).mockResolvedValue(mockStats);

      await adminController.getSystemStats(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockStats);
    });

    it('should handle errors appropriately', async () => {
      (adminModel.getSystemStats as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.getSystemStats(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getSystemLogs', () => {
    const mockQuery: SystemLogQuery = {
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      type: 'login'
    };

    const mockLogs: SystemLog[] = [{
      id: 1,
      user_id: 1,
      user_login: 'test',
      activity_type_id: 1,
      activity_name: 'login',
      description: 'User logged in',
      created_on: new Date()
    }];

    it('should return system logs successfully', async () => {
      await adminController.getSystemLogs(
        { ...mockReq, query: mockQuery } as unknown as Request<{}, {}, {}, SystemLogQuery>,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockLogs);
      expect(adminModel.getSystemLogs).toHaveBeenCalledWith(
        mockPool,
        mockQuery.startDate,
        mockQuery.endDate,
        mockQuery.type
      );
    });

    it('should handle empty query parameters', async () => {
      await adminController.getSystemLogs(
        { ...mockReq, query: {} } as unknown as Request<{}, {}, {}, SystemLogQuery>,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockLogs);
      expect(adminModel.getSystemLogs).toHaveBeenCalledWith(
        mockPool,
        undefined,
        undefined,
        undefined
      );
    });

    it('should handle errors appropriately', async () => {
      (adminModel.getSystemLogs as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.getSystemLogs(
        { ...mockReq, query: mockQuery } as unknown as Request<{}, {}, {}, SystemLogQuery>,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getAllPermissions', () => {
    const mockPermissions: Permission[] = [
      { id: 1, name: 'Create project' },
      { id: 2, name: 'Delete project' }
    ];

    it('should return all permissions successfully', async () => {
      (adminModel.getAllPermissions as jest.Mock).mockResolvedValue(mockPermissions);

      await adminController.getAllPermissions(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockPermissions);
    });

    it('should handle errors appropriately', async () => {
      (adminModel.getAllPermissions as jest.Mock).mockRejectedValue(new Error('Database error'));

      await adminController.getAllPermissions(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch permissions' });
    });
  });
});
