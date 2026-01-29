import { Request, Response } from 'express';
import { Pool } from 'pg';
import { CustomRequest } from '../../types/express';
import * as userController from '../userController';
import * as userModel from '../../models/userModel';
import * as permissionModel from '../../models/permissionModel';
import { Session } from 'express-session';

// Mock the models
jest.mock('../../models/userModel');
jest.mock('../../models/permissionModel');

describe('UserController', () => {
  let mockReq: Partial<Request & CustomRequest>;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;

  beforeEach(() => {
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
      destroy: jest.fn((callback: (err: any) => void) => {
        callback(null);
        return mockSession as unknown as Session;
      }),
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
      user: {
        id: '1',
        login: 'test',
        role_id: 1
      }
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
    };
    mockPool = {};
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: '1', login: 'user1', name: 'User 1', email: 'user1@test.com' },
        { id: '2', login: 'user2', name: 'User 2', email: 'user2@test.com' }
      ];
      (userModel.getUsers as jest.Mock).mockResolvedValue(mockUsers);

      await userController.getUsers(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(userModel.getUsers).toHaveBeenCalledWith(mockPool, { whereParams: undefined });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return users with whereParams filter', async () => {
      const mockUsers = [{ id: '1', login: 'user1', name: 'User 1', email: 'user1@test.com' }];
      const whereParams = { status_id: 1 };
      mockReq.query = { whereParams: JSON.stringify(whereParams) };
      (userModel.getUsers as jest.Mock).mockResolvedValue(mockUsers);

      await userController.getUsers(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(userModel.getUsers).toHaveBeenCalledWith(mockPool, { whereParams });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle errors', async () => {
      (userModel.getUsers as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.getUsers(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: '1', login: 'user1', name: 'User 1', email: 'user1@test.com' };
      mockReq.params = { id: '1' };
      (userModel.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await userController.getUserById(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(userModel.getUserById).toHaveBeenCalledWith(mockPool, '1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      mockReq.params = { id: '999' };
      (userModel.getUserById as jest.Mock).mockResolvedValue(null);

      await userController.getUserById(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      (userModel.getUserById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.getUserById(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockUserData = {
        login: 'newuser',
        name: 'New',
        surname: 'User',
        email: 'newuser@test.com',
        password: 'password123',
        role_id: 2
      };
      const createdUser = { id: '3', ...mockUserData };
      mockReq.body = mockUserData;
      (userModel.createUser as jest.Mock).mockResolvedValue(createdUser);

      await userController.createUser(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(userModel.createUser).toHaveBeenCalledWith(
        mockPool,
        mockUserData.login,
        mockUserData.name,
        mockUserData.surname,
        mockUserData.email,
        mockUserData.password,
        mockUserData.role_id
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdUser);
    });

    it('should handle errors', async () => {
      mockReq.body = { login: 'newuser', name: 'New', surname: 'User', email: 'newuser@test.com', password: 'pass', role_id: 2 };
      (userModel.createUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.createUser(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const mockUpdates = { name: 'Updated Name' };
      const updatedUser = { id: '1', login: 'user1', name: 'Updated Name', email: 'user1@test.com' };
      mockReq.params = { id: '1' };
      mockReq.body = mockUpdates;
      (userModel.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      await userController.updateUser(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(userModel.updateUser).toHaveBeenCalledWith(mockPool, mockUpdates, '1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should return 404 when user not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { name: 'Test' };
      (userModel.updateUser as jest.Mock).mockResolvedValue(null);

      await userController.updateUser(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Test' };
      (userModel.updateUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.updateUser(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('changeUserStatus', () => {
    it('should change user status successfully', async () => {
      const updatedUser = { id: '1', login: 'user1', name: 'User 1', status_id: 2 };
      mockReq.params = { id: '1' };
      mockReq.body = { status: 2 };
      (userModel.changeUserStatus as jest.Mock).mockResolvedValue(updatedUser);

      await userController.changeUserStatus(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(userModel.changeUserStatus).toHaveBeenCalledWith(mockPool, '1', 2);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should return 404 when user not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { status: 2 };
      (userModel.changeUserStatus as jest.Mock).mockResolvedValue(null);

      await userController.changeUserStatus(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { status: 2 };
      (userModel.changeUserStatus as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.changeUserStatus(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      mockReq.params = { id: '1' };
      (userModel.deleteUser as jest.Mock).mockResolvedValue({ id: '1' });

      await userController.deleteUser(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(userModel.deleteUser).toHaveBeenCalledWith(mockPool, '1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User deleted' });
    });

    it('should return 404 when user not found', async () => {
      mockReq.params = { id: '999' };
      (userModel.deleteUser as jest.Mock).mockResolvedValue(null);

      await userController.deleteUser(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      (userModel.deleteUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.deleteUser(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions', async () => {
      const mockPermissions = ['read:users', 'write:users', 'delete:users'];
      (permissionModel.getUserPermissions as jest.Mock).mockResolvedValue(mockPermissions);

      await userController.getUserPermissions(
        mockReq as CustomRequest,
        mockRes as Response,
        mockPool as Pool
      );

      expect(permissionModel.getUserPermissions).toHaveBeenCalledWith(mockPool, '1');
      expect(mockRes.json).toHaveBeenCalledWith(mockPermissions);
    });

    it('should return 401 when not authenticated', async () => {
      mockReq.session!.user = undefined;

      await userController.getUserPermissions(
        mockReq as CustomRequest,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    });

    it('should handle errors', async () => {
      (permissionModel.getUserPermissions as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.getUserPermissions(
        mockReq as CustomRequest,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
