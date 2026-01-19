import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as roleController from '../roleController';
import * as roleModel from '../../models/roleModel';

// Mock the model
jest.mock('../../models/roleModel');

describe('RoleController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;

  beforeEach(() => {
    mockReq = {
      params: {},
      query: {},
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockPool = {};
    jest.clearAllMocks();
  });

  describe('getRoles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'User' }
      ];
      (roleModel.getRoles as jest.Mock).mockResolvedValue(mockRoles);

      await roleController.getRoles(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(roleModel.getRoles).toHaveBeenCalledWith(mockPool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockRoles);
    });

    it('should handle errors', async () => {
      (roleModel.getRoles as jest.Mock).mockRejectedValue(new Error('Database error'));

      await roleController.getRoles(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to get roles' });
    });
  });

  describe('createRole', () => {
    it('should create a role successfully', async () => {
      const mockRoleData = { name: 'New Role', permissions: [1, 2, 3] };
      mockReq.body = mockRoleData;
      (roleModel.createRole as jest.Mock).mockResolvedValue(3);

      await roleController.createRole(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(roleModel.createRole).toHaveBeenCalledWith(mockPool, mockRoleData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Role created successfully',
        id: 3
      });
    });

    it('should return 400 when name is missing', async () => {
      mockReq.body = { permissions: [1, 2] };

      await roleController.createRole(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Role name is required' });
    });

    it('should return 409 for duplicate role name', async () => {
      const duplicateError = new Error('Unique constraint violation') as Error & { code: string };
      duplicateError.code = '23505';
      mockReq.body = { name: 'Admin' };
      (roleModel.createRole as jest.Mock).mockRejectedValue(duplicateError);

      await roleController.createRole(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Role with this name already exists' });
    });

    it('should handle other errors', async () => {
      mockReq.body = { name: 'New Role' };
      (roleModel.createRole as jest.Mock).mockRejectedValue(new Error('Database error'));

      await roleController.createRole(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to create role' });
    });
  });

  describe('updateRole', () => {
    it('should update a role successfully', async () => {
      const mockRoleData = { name: 'Updated Role', permissions: [1, 2, 3] };
      mockReq.params = { id: '1' };
      mockReq.body = mockRoleData;
      (roleModel.updateRole as jest.Mock).mockResolvedValue(undefined);

      await roleController.updateRole(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(roleModel.updateRole).toHaveBeenCalledWith(mockPool, '1', mockRoleData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Role updated successfully',
        id: '1'
      });
    });

    it('should return 400 when ID is missing', async () => {
      mockReq.params = {};
      mockReq.body = { name: 'Updated Role' };

      await roleController.updateRole(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Role ID is required' });
    });

    it('should return 400 when name is missing', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { permissions: [1, 2] };

      await roleController.updateRole(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Role name is required' });
    });

    it('should return 409 for duplicate role name', async () => {
      const duplicateError = new Error('Unique constraint violation') as Error & { code: string };
      duplicateError.code = '23505';
      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Admin' };
      (roleModel.updateRole as jest.Mock).mockRejectedValue(duplicateError);

      await roleController.updateRole(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Role with this name already exists' });
    });

    it('should return 404 when role not found', async () => {
      const notFoundError = new Error('Not found') as Error & { code: string };
      notFoundError.code = '404';
      mockReq.params = { id: '999' };
      mockReq.body = { name: 'Updated Role' };
      (roleModel.updateRole as jest.Mock).mockRejectedValue(notFoundError);

      await roleController.updateRole(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Role not found' });
    });

    it('should handle other errors', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Updated Role' };
      (roleModel.updateRole as jest.Mock).mockRejectedValue(new Error('Database error'));

      await roleController.updateRole(
        mockReq as Request,
        mockRes as Response,
        mockPool as Pool
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to update role' });
    });
  });
});
