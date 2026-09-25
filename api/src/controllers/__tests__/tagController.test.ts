import { Response } from 'express';
import { Pool } from 'pg';
import * as tagController from '../tagController';
import * as tagModel from '../../models/tagModel';

jest.mock('../../models/tagModel');

describe('TagController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;

  beforeEach(() => {
    mockReq = { params: {}, query: {}, body: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockPool = {};
    jest.clearAllMocks();
  });

  const call = (
    fn: (req: any, res: Response, pool: Pool) => Promise<unknown>,
  ) => fn(mockReq, mockRes as Response, mockPool as Pool);

  describe('getTags', () => {
    it('should return all tags', async () => {
      const mockTags = [{ id: '1', name: 'Tag1', color: '#FF0000' }];
      (tagModel.getTags as jest.Mock).mockResolvedValue(mockTags);
      await call(tagController.getTags);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTags);
    });

    it('rethrows model errors', async () => {
      (tagModel.getTags as jest.Mock).mockRejectedValue(new Error('DB error'));
      await expect(call(tagController.getTags)).rejects.toThrow('DB error');
    });
  });

  describe('createTag', () => {
    it('should create a tag with a trimmed name', async () => {
      mockReq.body = { name: ' NewTag ', color: '#00FF00', icon: '' };
      const createdTag = { id: '2', name: 'NewTag', color: '#00FF00' };
      (tagModel.createTag as jest.Mock).mockResolvedValue(createdTag);
      await call(tagController.createTag);
      expect(tagModel.createTag).toHaveBeenCalledWith(
        mockPool,
        'NewTag',
        '#00FF00',
        undefined,
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdTag);
    });

    it.each([
      [{ color: '#00FF00' }, 'Name and color are required'],
      [{ name: 'Tag' }, 'Name and color are required'],
      [{ name: '   ', color: '#00FF00' }, expect.stringContaining('Name')],
      [{ name: 'x'.repeat(51), color: '#00FF00' }, expect.any(String)],
      [{ name: 'Tag', color: 'red' }, 'Invalid color format'],
      [{ name: 'Tag', color: '#00FF00', icon: '<svg>' }, 'Invalid icon'],
      [{ name: 5, color: '#00FF00' }, 'Invalid name'],
    ])('returns 400 for invalid input #%#', async (body, error) => {
      mockReq.body = body;
      await call(tagController.createTag);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error });
      expect(tagModel.createTag).not.toHaveBeenCalled();
    });

    it('rethrows model errors', async () => {
      mockReq.body = { name: 'NewTag', color: '#00FF00' };
      (tagModel.createTag as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      await expect(call(tagController.createTag)).rejects.toThrow('DB error');
    });
  });

  describe('addTaskTags', () => {
    it('adds tags to the task in the route and returns its tags', async () => {
      mockReq.params = { id: '7' };
      mockReq.body = { tagIds: [1, '2'] };
      const tags = [{ id: 1 }, { id: 2 }];
      (tagModel.addTaskTags as jest.Mock).mockResolvedValue(undefined);
      (tagModel.getTaskTags as jest.Mock).mockResolvedValue(tags);
      await call(tagController.addTaskTags);
      expect(tagModel.addTaskTags).toHaveBeenCalledWith(mockPool, '7', [1, 2]);
      expect(tagModel.getTaskTags).toHaveBeenCalledWith(mockPool, '7');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(tags);
    });

    it.each([[undefined], ['1'], [[1, 'x']], [[0]], [[1.5]], [[40000]]])(
      'returns 400 for invalid tagIds #%#',
      async (tagIds) => {
        mockReq.params = { id: '7' };
        mockReq.body = { tagIds };
        await call(tagController.addTaskTags);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(tagModel.addTaskTags).not.toHaveBeenCalled();
      },
    );
  });

  describe('removeTaskTag', () => {
    it('should remove tag from task', async () => {
      mockReq.params = { id: '7', tagId: '1' };
      (tagModel.removeTaskTag as jest.Mock).mockResolvedValue(true);
      await call(tagController.removeTaskTag);
      expect(tagModel.removeTaskTag).toHaveBeenCalledWith(mockPool, '7', '1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tag removed successfully',
      });
    });

    it('returns 404 when the tag is not on the task', async () => {
      mockReq.params = { id: '7', tagId: '1' };
      (tagModel.removeTaskTag as jest.Mock).mockResolvedValue(false);
      await call(tagController.removeTaskTag);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getTaskTags', () => {
    it('should return task tags', async () => {
      mockReq.params = { id: '7' };
      const mockTags = [{ id: '1', name: 'Tag1' }];
      (tagModel.getTaskTags as jest.Mock).mockResolvedValue(mockTags);
      await call(tagController.getTaskTags);
      expect(tagModel.getTaskTags).toHaveBeenCalledWith(mockPool, '7');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTags);
    });
  });

  describe('updateTag', () => {
    it('updates only the provided fields', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { color: '#0000FF' };
      const updatedTag = { id: '1', name: 'Tag', color: '#0000FF' };
      (tagModel.updateTag as jest.Mock).mockResolvedValue(updatedTag);
      await call(tagController.updateTag);
      expect(tagModel.updateTag).toHaveBeenCalledWith(mockPool, '1', {
        color: '#0000FF',
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedTag);
    });

    it('returns 400 for an invalid color', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { color: 'blue' };
      await call(tagController.updateTag);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(tagModel.updateTag).not.toHaveBeenCalled();
    });

    it('returns 404 when the tag does not exist', async () => {
      mockReq.params = { id: '99' };
      mockReq.body = { name: 'Tag' };
      (tagModel.updateTag as jest.Mock).mockResolvedValue(null);
      await call(tagController.updateTag);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag', async () => {
      mockReq.params = { id: '1' };
      (tagModel.deleteTag as jest.Mock).mockResolvedValue({ id: 1 });
      await call(tagController.deleteTag);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tag deleted successfully',
      });
    });

    it('returns 404 when the tag is missing or inactive', async () => {
      mockReq.params = { id: '1' };
      (tagModel.deleteTag as jest.Mock).mockResolvedValue(null);
      await call(tagController.deleteTag);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});
