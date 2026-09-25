import { Request, Response } from 'express';
import { Pool } from 'pg';
import { CustomRequest } from '../../types/express';
import * as userController from '../userController';
import * as userModel from '../../models/userModel';
import * as permissionModel from '../../models/permissionModel';
import * as sessionModel from '../../models/sessionModel';
import { Session } from 'express-session';

jest.mock('../../models/userModel');
jest.mock('../../models/permissionModel');
jest.mock('../../models/sessionModel');

const STRONG_PASSWORD = 'Correct-Horse-Battery-9';

describe('UserController', () => {
  let mockReq: Partial<Request & CustomRequest>;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;

  beforeEach(() => {
    const mockSession = {
      id: 'test-session-id',
      user: { id: '1', login: 'test', role_id: 1 },
    } as unknown as Session &
      Partial<{ user: { id: string; login: string; role_id: number } }>;

    mockReq = {
      params: {},
      query: {},
      body: {},
      session: mockSession,
      sessionID: 'test-session-id',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockPool = {};
  });

  const call = (
    handler: (req: any, res: Response, pool: Pool) => Promise<unknown>,
  ) => handler(mockReq, mockRes as Response, mockPool as Pool);

  describe('getUsers', () => {
    it('defaults to active users', async () => {
      const mockUsers = [{ id: '1', login: 'user1' }];
      (userModel.getUsers as jest.Mock).mockResolvedValue(mockUsers);

      await call(userController.getUsers);

      expect(userModel.getUsers).toHaveBeenCalledWith(mockPool, {
        whereParams: { status_id: 1 },
        includeDeleted: false,
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });

    it('passes whereParams through', async () => {
      const whereParams = { role_id: 2 };
      mockReq.query = { whereParams: JSON.stringify(whereParams) };
      (userModel.getUsers as jest.Mock).mockResolvedValue([]);

      await call(userController.getUsers);

      expect(userModel.getUsers).toHaveBeenCalledWith(mockPool, {
        whereParams,
        includeDeleted: false,
      });
    });

    it('includes every status with all=true', async () => {
      mockReq.query = { all: 'true' };
      (userModel.getUsers as jest.Mock).mockResolvedValue([]);

      await call(userController.getUsers);

      expect(userModel.getUsers).toHaveBeenCalledWith(mockPool, {
        whereParams: {},
        includeDeleted: true,
      });
    });

    it.each(['{bad', '[1,2]', 'null'])(
      'returns 400 for whereParams %s',
      async (value) => {
        mockReq.query = { whereParams: value };

        await call(userController.getUsers);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid whereParams',
        });
        expect(userModel.getUsers).not.toHaveBeenCalled();
      },
    );

    it('propagates errors', async () => {
      (userModel.getUsers as jest.Mock).mockRejectedValue(new Error('db'));
      await expect(call(userController.getUsers)).rejects.toThrow('db');
    });
  });

  describe('getUserOptions', () => {
    it('returns user options', async () => {
      const options = [{ id: 1, login: 'a', name: 'A', surname: 'B' }];
      (userModel.getUserOptions as jest.Mock).mockResolvedValue(options);

      await call(userController.getUserOptions);

      expect(userModel.getUserOptions).toHaveBeenCalledWith(mockPool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(options);
    });
  });

  describe('getUserStatuses', () => {
    it('returns user statuses', async () => {
      const statuses = [{ id: 1, name: 'Active' }];
      (userModel.getUserStatuses as jest.Mock).mockResolvedValue(statuses);

      await call(userController.getUserStatuses);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(statuses);
    });
  });

  describe('getUserById', () => {
    it('returns a user when found', async () => {
      const user = { id: '1', login: 'user1' };
      mockReq.params = { id: '1' };
      (userModel.getUserById as jest.Mock).mockResolvedValue(user);

      await call(userController.getUserById);

      expect(userModel.getUserById).toHaveBeenCalledWith(mockPool, '1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(user);
    });

    it('returns 404 when user not found', async () => {
      mockReq.params = { id: '999' };
      (userModel.getUserById as jest.Mock).mockResolvedValue(null);

      await call(userController.getUserById);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('returns 400 for a non-numeric id', async () => {
      mockReq.params = { id: 'abc' };

      await call(userController.getUserById);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(userModel.getUserById).not.toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    const validBody = {
      login: 'newuser',
      name: 'New',
      surname: 'User',
      email: 'newuser@test.com',
      password: STRONG_PASSWORD,
      role_id: 2,
    };

    it('creates a user', async () => {
      const createdUser = { id: '3', ...validBody };
      mockReq.body = validBody;
      (userModel.createUser as jest.Mock).mockResolvedValue(createdUser);

      await call(userController.createUser);

      expect(userModel.createUser).toHaveBeenCalledWith(
        mockPool,
        'newuser',
        'New',
        'User',
        'newuser@test.com',
        STRONG_PASSWORD,
        2,
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdUser);
    });

    it('rejects a weak password', async () => {
      mockReq.body = { ...validBody, password: 'short' };

      await call(userController.createUser);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(userModel.createUser).not.toHaveBeenCalled();
    });

    it.each(['login', 'name', 'surname', 'email'])(
      'rejects a missing %s',
      async (field) => {
        mockReq.body = { ...validBody, [field]: '' };

        await call(userController.createUser);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      },
    );

    it('rejects an invalid role_id', async () => {
      mockReq.body = { ...validBody, role_id: 'x' };

      await call(userController.createUser);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('rejects over-long fields', async () => {
      mockReq.body = { ...validBody, name: 'a'.repeat(256) };

      await call(userController.createUser);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateUser', () => {
    it('updates a user without touching sessions', async () => {
      const updatedUser = { id: '2', name: 'Updated', status_id: 1 };
      mockReq.params = { id: '2' };
      mockReq.body = { name: 'Updated', ignored: true };
      (userModel.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      await call(userController.updateUser);

      expect(userModel.updateUser).toHaveBeenCalledWith(
        mockPool,
        { name: 'Updated' },
        '2',
      );
      expect(sessionModel.deleteUserSessions).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedUser);
    });

    it('drops role_id and status_id on self update', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Me', role_id: 1, status_id: 2 };
      (userModel.updateUser as jest.Mock).mockResolvedValue({
        id: '1',
        status_id: 1,
      });

      await call(userController.updateUser);

      expect(userModel.updateUser).toHaveBeenCalledWith(
        mockPool,
        { name: 'Me' },
        '1',
      );
    });

    it('rejects a weak password', async () => {
      mockReq.params = { id: '2' };
      mockReq.body = { password: 'short' };

      await call(userController.updateUser);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(userModel.updateUser).not.toHaveBeenCalled();
    });

    it('ends the sessions of a user whose password was reset', async () => {
      mockReq.params = { id: '2' };
      mockReq.body = { password: STRONG_PASSWORD };
      (userModel.updateUser as jest.Mock).mockResolvedValue({
        id: '2',
        status_id: 1,
      });

      await call(userController.updateUser);

      expect(sessionModel.deleteUserSessions).toHaveBeenCalledWith(
        mockPool,
        '2',
        undefined,
      );
    });

    it('keeps the current session on a self password change', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { password: STRONG_PASSWORD };
      (userModel.updateUser as jest.Mock).mockResolvedValue({
        id: '1',
        status_id: 1,
      });

      await call(userController.updateUser);

      expect(sessionModel.deleteUserSessions).toHaveBeenCalledWith(
        mockPool,
        '1',
        'test-session-id',
      );
    });

    it('ends the sessions of a deactivated user', async () => {
      mockReq.params = { id: '2' };
      mockReq.body = { status_id: 2 };
      (userModel.updateUser as jest.Mock).mockResolvedValue({
        id: '2',
        status_id: 2,
      });

      await call(userController.updateUser);

      expect(sessionModel.deleteUserSessions).toHaveBeenCalledWith(
        mockPool,
        '2',
        undefined,
      );
    });

    it('returns 404 when user not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { name: 'Test' };
      (userModel.updateUser as jest.Mock).mockResolvedValue(null);

      await call(userController.updateUser);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('changeUserStatus', () => {
    it('deactivates a user and ends their sessions', async () => {
      const updatedUser = { id: '2', status_id: 2 };
      mockReq.params = { id: '2' };
      mockReq.body = { status: 2 };
      (userModel.changeUserStatus as jest.Mock).mockResolvedValue(updatedUser);

      await call(userController.changeUserStatus);

      expect(userModel.changeUserStatus).toHaveBeenCalledWith(mockPool, '2', 2);
      expect(sessionModel.deleteUserSessions).toHaveBeenCalledWith(
        mockPool,
        '2',
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedUser);
    });

    it('keeps sessions when activating', async () => {
      mockReq.params = { id: '2' };
      mockReq.body = { status: 1 };
      (userModel.changeUserStatus as jest.Mock).mockResolvedValue({ id: '2' });

      await call(userController.changeUserStatus);

      expect(sessionModel.deleteUserSessions).not.toHaveBeenCalled();
    });

    it('rejects a self status change', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { status: 2 };

      await call(userController.changeUserStatus);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(userModel.changeUserStatus).not.toHaveBeenCalled();
    });

    it('rejects an invalid status', async () => {
      mockReq.params = { id: '2' };
      mockReq.body = { status: 'x' };

      await call(userController.changeUserStatus);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when user not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { status: 2 };
      (userModel.changeUserStatus as jest.Mock).mockResolvedValue(null);

      await call(userController.changeUserStatus);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteUser', () => {
    it('deletes a user and ends their sessions', async () => {
      mockReq.params = { id: '2' };
      (userModel.deleteUser as jest.Mock).mockResolvedValue({ id: '2' });

      await call(userController.deleteUser);

      expect(userModel.deleteUser).toHaveBeenCalledWith(mockPool, '2');
      expect(sessionModel.deleteUserSessions).toHaveBeenCalledWith(
        mockPool,
        '2',
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User deleted' });
    });

    it('rejects self deletion', async () => {
      mockReq.params = { id: '1' };

      await call(userController.deleteUser);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(userModel.deleteUser).not.toHaveBeenCalled();
    });

    it('returns 404 when user not found', async () => {
      mockReq.params = { id: '999' };
      (userModel.deleteUser as jest.Mock).mockResolvedValue(null);

      await call(userController.deleteUser);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(sessionModel.deleteUserSessions).not.toHaveBeenCalled();
    });
  });

  describe('getUserPermissions', () => {
    it('returns user permissions', async () => {
      const permissions = ['Admin'];
      (permissionModel.getUserPermissions as jest.Mock).mockResolvedValue(
        permissions,
      );

      await call(userController.getUserPermissions);

      expect(permissionModel.getUserPermissions).toHaveBeenCalledWith(
        mockPool,
        '1',
      );
      expect(mockRes.json).toHaveBeenCalledWith(permissions);
    });

    it('throws 401 when not authenticated', async () => {
      mockReq.session!.user = undefined;

      await expect(
        call(userController.getUserPermissions),
      ).rejects.toMatchObject({ status: 401 });
    });
  });
});
