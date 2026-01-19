import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as taskTypeController from '../taskTypeController';
import * as taskTypeModel from '../../models/taskTypeModel';

jest.mock('../../models/taskTypeModel');

describe('TaskTypeController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;

  beforeEach(() => {
    mockReq = { params: {}, query: {}, body: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockPool = {};
    jest.clearAllMocks();
  });

  describe('getTaskTypes', () => {
    it('should return all task types', async () => {
      const mockTypes = [{ id: '1', name: 'Bug', color: '#FF0000' }];
      (taskTypeModel.getTaskTypes as jest.Mock).mockResolvedValue(mockTypes);
      await taskTypeController.getTaskTypes(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.json).toHaveBeenCalledWith(mockTypes);
    });

    it('should handle errors', async () => {
      (taskTypeModel.getTaskTypes as jest.Mock).mockRejectedValue(new Error('DB error'));
      await taskTypeController.getTaskTypes(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getTaskTypeById', () => {
    it('should return a task type', async () => {
      mockReq.params = { id: '1' };
      const mockType = { id: '1', name: 'Bug', color: '#FF0000' };
      (taskTypeModel.getTaskTypeById as jest.Mock).mockResolvedValue(mockType);
      await taskTypeController.getTaskTypeById(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.json).toHaveBeenCalledWith(mockType);
    });

    it('should return 404 when not found', async () => {
      mockReq.params = { id: '999' };
      (taskTypeModel.getTaskTypeById as jest.Mock).mockResolvedValue(null);
      await taskTypeController.getTaskTypeById(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createTaskType', () => {
    it('should create a task type', async () => {
      mockReq.body = { name: 'Feature', color: '#00FF00' };
      const createdType = { id: '2', name: 'Feature', color: '#00FF00' };
      (taskTypeModel.createTaskType as jest.Mock).mockResolvedValue(createdType);
      await taskTypeController.createTaskType(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 when name is missing', async () => {
      mockReq.body = { color: '#00FF00' };
      await taskTypeController.createTaskType(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Name and color are required' });
    });

    it('should return 400 when color format is invalid', async () => {
      mockReq.body = { name: 'Feature', color: 'invalid' };
      await taskTypeController.createTaskType(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid color format' });
    });
  });

  describe('updateTaskType', () => {
    it('should update a task type', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Updated Bug' };
      const updatedType = { id: '1', name: 'Updated Bug' };
      (taskTypeModel.updateTaskType as jest.Mock).mockResolvedValue(updatedType);
      await taskTypeController.updateTaskType(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.json).toHaveBeenCalledWith(updatedType);
    });

    it('should return 404 when not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { name: 'Updated' };
      (taskTypeModel.updateTaskType as jest.Mock).mockResolvedValue(null);
      await taskTypeController.updateTaskType(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteTaskType', () => {
    it('should delete a task type', async () => {
      mockReq.params = { id: '1' };
      (taskTypeModel.deleteTaskType as jest.Mock).mockResolvedValue(true);
      await taskTypeController.deleteTaskType(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Task type deleted successfully' });
    });

    it('should return 404 when not found', async () => {
      mockReq.params = { id: '999' };
      (taskTypeModel.deleteTaskType as jest.Mock).mockResolvedValue(null);
      await taskTypeController.deleteTaskType(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});
