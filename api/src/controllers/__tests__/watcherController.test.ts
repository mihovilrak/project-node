import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as watcherController from '../watcherController';
import * as watcherModel from '../../models/watcherModel';

jest.mock('../../models/watcherModel');

describe('WatcherController', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;

  beforeEach(() => {
    mockReq = { params: {}, query: {}, body: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
    mockPool = {};
    jest.clearAllMocks();
  });

  describe('getTaskWatchers', () => {
    it('should return task watchers', async () => {
      mockReq.params = { id: '1' };
      const mockWatchers = [{ id: '1', user_id: '1', name: 'User 1' }];
      (watcherModel.getTaskWatchers as jest.Mock).mockResolvedValue(mockWatchers);
      await watcherController.getTaskWatchers(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockWatchers);
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      (watcherModel.getTaskWatchers as jest.Mock).mockRejectedValue(new Error('DB error'));
      await watcherController.getTaskWatchers(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('addTaskWatcher', () => {
    it('should add a task watcher', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { userId: '2' };
      const mockWatcher = { id: '1', task_id: '1', user_id: '2' };
      (watcherModel.addTaskWatcher as jest.Mock).mockResolvedValue(mockWatcher);
      await watcherController.addTaskWatcher(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockWatcher);
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { userId: '2' };
      (watcherModel.addTaskWatcher as jest.Mock).mockRejectedValue(new Error('DB error'));
      await watcherController.addTaskWatcher(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('removeTaskWatcher', () => {
    it('should remove a task watcher successfully', async () => {
      mockReq.params = { id: '1', userId: '2' };
      (watcherModel.removeTaskWatcher as jest.Mock).mockResolvedValue(1);
      await watcherController.removeTaskWatcher(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 404 when watcher not found', async () => {
      mockReq.params = { id: '1', userId: '999' };
      (watcherModel.removeTaskWatcher as jest.Mock).mockResolvedValue(0);
      await watcherController.removeTaskWatcher(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Watcher not found' });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1', userId: '2' };
      (watcherModel.removeTaskWatcher as jest.Mock).mockRejectedValue(new Error('DB error'));
      await watcherController.removeTaskWatcher(mockReq, mockRes as Response, mockPool as Pool);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
