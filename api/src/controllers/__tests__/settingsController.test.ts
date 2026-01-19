import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as settingsController from '../settingsController';
import * as settingsModel from '../../models/settingsModel';
import { Session } from 'express-session';
import { CustomRequest } from '../../types/express';

jest.mock('../../models/settingsModel');

describe('SettingsController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;

  beforeEach(() => {
    const mockSession = {
      id: 'test-session-id',
      cookie: { originalMaxAge: null },
      user: { id: '1', login: 'test', role_id: 1 }
    } as unknown as Session;

    mockReq = { params: {}, query: {}, body: {}, session: mockSession };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockPool = {};
    jest.clearAllMocks();
  });

  describe('getSystemSettings', () => {
    it('should return system settings', async () => {
      const mockSettings = { app_name: 'Test App', theme: 'dark' };
      (settingsModel.getSystemSettings as jest.Mock).mockResolvedValue(mockSettings);
      await settingsController.getSystemSettings(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockSettings);
    });

    it('should handle errors', async () => {
      (settingsModel.getSystemSettings as jest.Mock).mockRejectedValue(new Error('DB error'));
      await settingsController.getSystemSettings(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateSystemSettings', () => {
    it('should update system settings', async () => {
      mockReq.body = { app_name: 'New App Name' };
      const updatedSettings = { app_name: 'New App Name' };
      (settingsModel.updateSystemSettings as jest.Mock).mockResolvedValue(updatedSettings);
      await settingsController.updateSystemSettings(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors', async () => {
      mockReq.body = { app_name: 'New App Name' };
      (settingsModel.updateSystemSettings as jest.Mock).mockRejectedValue(new Error('DB error'));
      await settingsController.updateSystemSettings(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUserSettings', () => {
    it('should return user settings', async () => {
      const mockSettings = { theme: 'light', notifications: true };
      (settingsModel.getUserSettings as jest.Mock).mockResolvedValue(mockSettings);
      await settingsController.getUserSettings(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockSettings);
    });

    it('should return 401 when not authenticated', async () => {
      mockReq.session.user = undefined;
      await settingsController.getUserSettings(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should return empty object when no settings', async () => {
      (settingsModel.getUserSettings as jest.Mock).mockResolvedValue(null);
      await settingsController.getUserSettings(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.json).toHaveBeenCalledWith({});
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings', async () => {
      mockReq.body = { theme: 'dark' };
      const updatedSettings = { theme: 'dark' };
      (settingsModel.updateUserSettings as jest.Mock).mockResolvedValue(updatedSettings);
      await settingsController.updateUserSettings(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 401 when not authenticated', async () => {
      mockReq.session.user = undefined;
      mockReq.body = { theme: 'dark' };
      await settingsController.updateUserSettings(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
