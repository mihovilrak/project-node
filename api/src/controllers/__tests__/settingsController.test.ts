import { Request, Response } from 'express';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import * as settingsController from '../settingsController';
import * as settingsModel from '../../models/settingsModel';
import { Session } from 'express-session';
import { CustomRequest } from '../../types/express';

jest.mock('../../models/settingsModel');
jest.mock('nodemailer');

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

  describe('getAppTheme', () => {
    it('should return app theme', async () => {
      const mockSettings = { app_name: 'Test App', theme: 'dark' };
      (settingsModel.getSystemSettings as jest.Mock).mockResolvedValue(mockSettings);
      await settingsController.getAppTheme(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ theme: 'dark' });
    });

    it('should return default theme when no settings found', async () => {
      (settingsModel.getSystemSettings as jest.Mock).mockResolvedValue(null);
      await settingsController.getAppTheme(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ theme: 'light' });
    });

    it('should return default theme when theme is not set', async () => {
      const mockSettings = { app_name: 'Test App' };
      (settingsModel.getSystemSettings as jest.Mock).mockResolvedValue(mockSettings);
      await settingsController.getAppTheme(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ theme: 'light' });
    });

    it('should handle errors', async () => {
      (settingsModel.getSystemSettings as jest.Mock).mockRejectedValue(new Error('DB error'));
      await settingsController.getAppTheme(mockReq, mockRes as Response, mockPool as Pool);
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

  describe('testSmtpConnection', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        EMAIL_ENABLED: 'true',
        EMAIL_HOST: 'smtp.test.com',
        EMAIL_PORT: '587',
        EMAIL_SECURE: 'false',
        EMAIL_USER: 'test@test.com',
        EMAIL_PASSWORD: 'testpassword',
        EMAIL_FROM: 'Test <test@test.com>',
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return 400 when email is missing', async () => {
      mockReq.body = {};
      await settingsController.testSmtpConnection(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email address is required'
      });
    });

    it('should return 400 for invalid email format', async () => {
      mockReq.body = { email: 'invalid-email' };
      await settingsController.testSmtpConnection(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email address format'
      });
    });

    it('should return 400 when email is disabled', async () => {
      process.env.EMAIL_ENABLED = 'false';
      mockReq.body = { email: 'test@example.com' };
      await settingsController.testSmtpConnection(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email sending is disabled. Set EMAIL_ENABLED=true in environment.'
      });
    });

    it('should send test email successfully', async () => {
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
      const mockVerify = jest.fn().mockResolvedValue(true);
      const mockTransporter = {
        sendMail: mockSendMail,
        verify: mockVerify,
      };

      (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

      mockReq.body = { email: 'recipient@example.com' };
      await settingsController.testSmtpConnection(mockReq, mockRes as Response, mockPool as Pool);

      expect(mockVerify).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'recipient@example.com',
          subject: 'SMTP Test - Project Management App',
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Test email sent successfully to recipient@example.com',
        messageId: 'test-message-id'
      });
    });

    it('should handle SMTP connection failure', async () => {
      const mockVerify = jest.fn().mockRejectedValue(new Error('Connection refused'));
      const mockTransporter = {
        verify: mockVerify,
        sendMail: jest.fn(),
      };

      (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

      mockReq.body = { email: 'recipient@example.com' };
      await settingsController.testSmtpConnection(mockReq, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'SMTP test failed: Connection refused'
      });
    });

    it('should handle email sending failure', async () => {
      const mockVerify = jest.fn().mockResolvedValue(true);
      const mockSendMail = jest.fn().mockRejectedValue(new Error('Authentication failed'));
      const mockTransporter = {
        verify: mockVerify,
        sendMail: mockSendMail,
      };

      (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

      mockReq.body = { email: 'recipient@example.com' };
      await settingsController.testSmtpConnection(mockReq, mockRes as Response, mockPool as Pool);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'SMTP test failed: Authentication failed'
      });
    });

    it('should validate various email formats correctly', async () => {
      const validEmails = ['user@example.com', 'user.name@domain.org', 'user+tag@sub.domain.com'];
      const invalidEmails = ['invalid', '@example.com', 'user@', 'user @example.com'];

      for (const email of validEmails) {
        mockReq.body = { email };
        const mockVerify = jest.fn().mockResolvedValue(true);
        const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
        (nodemailer.createTransport as jest.Mock).mockReturnValue({ verify: mockVerify, sendMail: mockSendMail });
        
        await settingsController.testSmtpConnection(mockReq, mockRes as Response, mockPool as Pool);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        jest.clearAllMocks();
        mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      }

      for (const email of invalidEmails) {
        mockReq.body = { email };
        await settingsController.testSmtpConnection(mockReq, mockRes as Response, mockPool as Pool);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        jest.clearAllMocks();
        mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      }
    });
  });
});
