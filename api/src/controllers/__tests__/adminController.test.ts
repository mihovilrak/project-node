import { Response } from 'express';
import { Pool } from 'pg';
import * as adminModel from '../../models/adminModel';
import * as permissionModel from '../../models/permissionModel';
import * as adminController from '../adminController';

jest.mock('../../models/adminModel');
jest.mock('../../models/permissionModel');

describe('AdminController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  const mockPool = {} as Pool;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockReq = {
      params: {},
      query: {},
      body: {},
      session: { user: { id: '1', login: 'test', role_id: 1 } },
    };
  });

  describe('checkAdminAccess', () => {
    it('confirms access for an admin', async () => {
      (permissionModel.hasPermission as jest.Mock).mockResolvedValue(true);

      await adminController.checkAdminAccess(
        mockReq,
        mockRes as Response,
        mockPool,
      );

      expect(permissionModel.hasPermission).toHaveBeenCalledWith(
        mockPool,
        '1',
        'Admin',
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ isAdmin: true });
    });

    it('rejects an unauthenticated request with 401', async () => {
      mockReq.session = {};
      await expect(
        adminController.checkAdminAccess(mockReq, mockRes as Response, mockPool),
      ).rejects.toMatchObject({ status: 401 });
    });

    it('returns 403 for a non-admin', async () => {
      (permissionModel.hasPermission as jest.Mock).mockResolvedValue(false);

      await adminController.checkAdminAccess(
        mockReq,
        mockRes as Response,
        mockPool,
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('getSystemStats', () => {
    it('returns the stats', async () => {
      const stats = { total_users: 1 };
      (adminModel.getSystemStats as jest.Mock).mockResolvedValue(stats);

      await adminController.getSystemStats(
        mockReq,
        mockRes as Response,
        mockPool,
      );

      expect(mockRes.json).toHaveBeenCalledWith(stats);
    });

    it('forwards model errors', async () => {
      (adminModel.getSystemStats as jest.Mock).mockRejectedValue(
        new Error('DB'),
      );
      await expect(
        adminController.getSystemStats(mockReq, mockRes as Response, mockPool),
      ).rejects.toThrow('DB');
    });
  });

  describe('getTimeLogReport', () => {
    it('passes filters and pagination to the model', async () => {
      const logs = [{ id: 1 }];
      (adminModel.getTimeLogReport as jest.Mock).mockResolvedValue(logs);
      mockReq.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: '3',
        limit: '10',
        offset: '20',
      };

      await adminController.getTimeLogReport(
        mockReq,
        mockRes as Response,
        mockPool,
      );

      expect(adminModel.getTimeLogReport).toHaveBeenCalledWith(
        mockPool,
        { startDate: '2024-01-01', endDate: '2024-01-31', type: 3 },
        { limit: 10, offset: 20 },
      );
      expect(mockRes.json).toHaveBeenCalledWith(logs);
    });

    it('uses defaults without query parameters', async () => {
      (adminModel.getTimeLogReport as jest.Mock).mockResolvedValue([]);

      await adminController.getTimeLogReport(
        mockReq,
        mockRes as Response,
        mockPool,
      );

      expect(adminModel.getTimeLogReport).toHaveBeenCalledWith(
        mockPool,
        { startDate: undefined, endDate: undefined, type: undefined },
        { limit: 50, offset: 0 },
      );
    });

    it('rejects a non-numeric activity type', async () => {
      mockReq.query = { type: 'abc' };

      await adminController.getTimeLogReport(
        mockReq,
        mockRes as Response,
        mockPool,
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(adminModel.getTimeLogReport).not.toHaveBeenCalled();
    });
  });

  describe('getAllPermissions', () => {
    it('returns all permissions', async () => {
      const permissions = [{ id: 1, name: 'Admin' }];
      (adminModel.getAllPermissions as jest.Mock).mockResolvedValue(
        permissions,
      );

      await adminController.getAllPermissions(
        mockReq,
        mockRes as Response,
        mockPool,
      );

      expect(mockRes.json).toHaveBeenCalledWith(permissions);
    });
  });
});
