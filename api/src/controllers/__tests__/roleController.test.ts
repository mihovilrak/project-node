import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as roleController from '../roleController';
import * as roleModel from '../../models/roleModel';

jest.mock('../../models/roleModel');

const pgError = (code: string, message = 'db') =>
  Object.assign(new Error(message), { code });

describe('RoleController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;

  beforeEach(() => {
    mockReq = { params: {}, query: {}, body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockPool = {};
    jest.clearAllMocks();
  });

  const call = (fn: typeof roleController.getRoles) =>
    fn(mockReq as Request, mockRes as Response, mockPool as Pool);

  describe('getRoles', () => {
    it('should return all roles', async () => {
      const roles = [{ id: 1, name: 'Admin' }];
      (roleModel.getRoles as jest.Mock).mockResolvedValue(roles);

      await call(roleController.getRoles);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(roles);
    });

    it('should forward errors', async () => {
      (roleModel.getRoles as jest.Mock).mockRejectedValue(new Error('db'));
      await expect(call(roleController.getRoles)).rejects.toThrow('db');
    });
  });

  describe('createRole', () => {
    it('should create a role', async () => {
      mockReq.body = { name: 'New Role', permissions: [1, 2] };
      (roleModel.createRole as jest.Mock).mockResolvedValue(3);

      await call(roleController.createRole);

      expect(roleModel.createRole).toHaveBeenCalledWith(mockPool, mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Role created successfully',
        id: 3,
      });
    });

    it.each([{}, { name: '' }, { name: '  ' }, { name: 5 }])(
      'should return 400 for body %p',
      async (body) => {
        mockReq.body = body;
        await call(roleController.createRole);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(roleModel.createRole).not.toHaveBeenCalled();
      },
    );

    it('should forward a duplicate name to the error handler', async () => {
      mockReq.body = { name: 'Admin' };
      (roleModel.createRole as jest.Mock).mockRejectedValue(pgError('23505'));
      await expect(call(roleController.createRole)).rejects.toMatchObject({
        code: '23505',
      });
    });
  });

  describe('updateRole', () => {
    it('should update a role', async () => {
      mockReq.params = { id: '2' };
      mockReq.body = { name: 'Developer', permissions: [1] };
      (roleModel.updateRole as jest.Mock).mockResolvedValue(undefined);

      await call(roleController.updateRole);

      expect(roleModel.updateRole).toHaveBeenCalledWith(
        mockPool,
        '2',
        mockReq.body,
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Role updated successfully',
        id: 2,
      });
    });

    it('should return 400 for a non-numeric id', async () => {
      mockReq.params = { id: 'abc' };
      mockReq.body = { name: 'Developer' };
      await call(roleController.updateRole);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(roleModel.updateRole).not.toHaveBeenCalled();
    });

    it('should return 400 when name is missing', async () => {
      mockReq.params = { id: '2' };
      await call(roleController.updateRole);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 403 when the Admin role would be broken', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Admin', permissions: [] };
      (roleModel.updateRole as jest.Mock).mockRejectedValue(
        pgError('42501', 'The Admin role cannot be renamed'),
      );

      await call(roleController.updateRole);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'The Admin role cannot be renamed',
      });
    });

    it('should forward a missing role (P0002) to the error handler', async () => {
      mockReq.params = { id: '99' };
      mockReq.body = { name: 'Ghost' };
      (roleModel.updateRole as jest.Mock).mockRejectedValue(pgError('P0002'));
      await expect(call(roleController.updateRole)).rejects.toMatchObject({
        code: 'P0002',
      });
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      mockReq.params = { id: '4' };
      (roleModel.deleteRole as jest.Mock).mockResolvedValue(true);
      await call(roleController.deleteRole);
      expect(roleModel.deleteRole).toHaveBeenCalledWith(mockPool, '4');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 when the role does not exist', async () => {
      mockReq.params = { id: '99' };
      (roleModel.deleteRole as jest.Mock).mockResolvedValue(false);
      await call(roleController.deleteRole);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 409 while users hold the role', async () => {
      mockReq.params = { id: '4' };
      (roleModel.deleteRole as jest.Mock).mockRejectedValue(pgError('23503'));
      await call(roleController.deleteRole);
      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it('should return 403 for the Admin role', async () => {
      mockReq.params = { id: '1' };
      (roleModel.deleteRole as jest.Mock).mockRejectedValue(
        pgError('42501', 'The Admin role cannot be deleted'),
      );
      await call(roleController.deleteRole);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('should return 400 for a non-numeric id', async () => {
      mockReq.params = { id: 'x' };
      await call(roleController.deleteRole);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
