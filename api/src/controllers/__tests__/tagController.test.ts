import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as tagController from '../tagController';
import * as tagModel from '../../models/tagModel';
import { Session } from 'express-session';
import { CustomRequest } from '../../types/express';

jest.mock('../../models/tagModel');

describe('TagController', () => {
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

  describe('getTags', () => {
    it('should return all tags', async () => {
      const mockTags = [{ id: '1', name: 'Tag1', color: '#FF0000' }];
      (tagModel.getTags as jest.Mock).mockResolvedValue(mockTags);
      await tagController.getTags(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTags);
    });

    it('should handle errors', async () => {
      (tagModel.getTags as jest.Mock).mockRejectedValue(new Error('DB error'));
      await tagController.getTags(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createTag', () => {
    it('should create a tag successfully', async () => {
      mockReq.body = { name: 'NewTag', color: '#00FF00' };
      const createdTag = { id: '2', name: 'NewTag', color: '#00FF00' };
      (tagModel.createTag as jest.Mock).mockResolvedValue(createdTag);
      await tagController.createTag(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdTag);
    });

    it('should return 401 when not authenticated', async () => {
      mockReq.session.user = undefined;
      mockReq.body = { name: 'NewTag', color: '#00FF00' };
      await tagController.createTag(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should handle errors', async () => {
      mockReq.body = { name: 'NewTag', color: '#00FF00' };
      (tagModel.createTag as jest.Mock).mockRejectedValue(new Error('DB error'));
      await tagController.createTag(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('addTaskTags', () => {
    it('should add tags to task', async () => {
      mockReq.params = { taskId: '1' };
      mockReq.body = { tagIds: ['1', '2'] };
      (tagModel.addTaskTags as jest.Mock).mockResolvedValue({ success: true });
      await tagController.addTaskTags(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 401 when not authenticated', async () => {
      mockReq.session.user = undefined;
      mockReq.params = { taskId: '1' };
      mockReq.body = { tagIds: ['1'] };
      await tagController.addTaskTags(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('removeTaskTag', () => {
    it('should remove tag from task', async () => {
      mockReq.params = { taskId: '1', tagId: '1' };
      (tagModel.removeTaskTag as jest.Mock).mockResolvedValue(undefined);
      await tagController.removeTaskTag(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tag removed successfully' });
    });
  });

  describe('getTaskTags', () => {
    it('should return task tags', async () => {
      mockReq.params = { taskId: '1' };
      const mockTags = [{ id: '1', name: 'Tag1' }];
      (tagModel.getTaskTags as jest.Mock).mockResolvedValue(mockTags);
      await tagController.getTaskTags(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTags);
    });
  });

  describe('updateTag', () => {
    it('should update a tag', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { name: 'Updated', color: '#0000FF' };
      const updatedTag = { id: '1', name: 'Updated', color: '#0000FF' };
      (tagModel.updateTag as jest.Mock).mockResolvedValue(updatedTag);
      await tagController.updateTag(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag', async () => {
      mockReq.params = { id: '1' };
      (tagModel.deleteTag as jest.Mock).mockResolvedValue(undefined);
      await tagController.deleteTag(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tag deleted successfully' });
    });
  });
});
