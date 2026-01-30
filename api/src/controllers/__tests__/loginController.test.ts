import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as loginController from '../loginController';
import * as loginModel from '../../models/loginModel';
import { Session } from 'express-session';

// Mock the model
jest.mock('../../models/loginModel');

describe('LoginController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;
  let mockDestroy: jest.Mock;

  beforeEach(() => {
    mockDestroy = jest.fn((callback: (err: any) => void) => callback(null));
    
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
      regenerate: jest.fn((callback: (err: any) => void) => {
        callback(null);
        return mockSession as unknown as Session;
      }),
      destroy: mockDestroy,
      reload: jest.fn((callback: (err: any) => void) => {
        callback(null);
        return mockSession as unknown as Session;
      }),
      resetMaxAge: jest.fn().mockReturnThis(),
      touch: jest.fn(),
      save: jest.fn((callback?: (err: any) => void) => {
        if (callback) callback(null);
        return mockSession as unknown as Session;
      }),
      user: undefined
    } as unknown as Session & Partial<{ user: { id: string; login: string; role_id: number } }>;

    mockReq = {
      params: {},
      query: {},
      body: {},
      session: mockSession
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn()
    };
    mockPool = {};
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: '1',
        login: 'testuser',
        role_id: 1
      };
      mockReq.body = { login: 'testuser', password: 'password123' };
      (loginModel.login as jest.Mock).mockResolvedValue(mockUser);
      (loginModel.app_logins as jest.Mock).mockResolvedValue(undefined);

      await loginController.login(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(loginModel.login).toHaveBeenCalledWith(mockPool, 'testuser', 'password123');
      expect(loginModel.app_logins).toHaveBeenCalledWith(mockPool, '1');
      expect(mockReq.session!.user).toEqual(mockUser);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: mockUser
      });
    });

    it('should return 400 when login is missing', async () => {
      mockReq.body = { password: 'password123' };

      await loginController.login(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid request',
        message: 'login and password must be non-empty strings'
      });
      expect(loginModel.login).not.toHaveBeenCalled();
    });

    it('should return 400 when password is empty', async () => {
      mockReq.body = { login: 'testuser', password: '' };

      await loginController.login(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid request',
        message: 'login and password are required'
      });
      expect(loginModel.login).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid credentials', async () => {
      mockReq.body = { login: 'testuser', password: 'wrongpassword' };
      (loginModel.login as jest.Mock).mockResolvedValue(null);

      await loginController.login(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(loginModel.login).toHaveBeenCalledWith(mockPool, 'testuser', 'wrongpassword');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid username or password'
      });
    });

    it('should pass error to next on internal server error', async () => {
      const dbError = new Error('Database error');
      mockReq.body = { login: 'testuser', password: 'password123' };
      (loginModel.login as jest.Mock).mockRejectedValue(dbError);

      await expect(
        loginController.login(
          mockReq as Request,
          mockRes as Response,
          mockPool as Pool
        )
      ).rejects.toThrow('Database error');
      expect(mockRes.status).not.toHaveBeenCalledWith(500);
      expect(mockRes.json).not.toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('logout', () => {
    it('should logout successfully', () => {
      loginController.logout(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockDestroy).toHaveBeenCalled();
      expect(mockRes.clearCookie).toHaveBeenCalledWith('connect.sid');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Logged out successfully'
      });
    });

    it('should return 500 on session destroy error', () => {
      mockDestroy.mockImplementation((callback: (err: any) => void) => callback(new Error('Session error')));

      loginController.logout(
        mockReq as Request,
        mockRes as Response
      );

      expect(mockDestroy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to logout'
      });
    });
  });
});
