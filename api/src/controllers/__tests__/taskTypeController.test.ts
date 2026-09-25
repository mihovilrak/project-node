import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as taskTypeModel from '../../models/taskTypeModel';
import * as taskTypeController from '../taskTypeController';
import { AVAILABLE_ICONS } from '../../utils/iconConstants';

jest.mock('../../models/taskTypeModel');

describe('TaskTypeController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const pool = {} as Pool;
  const row = { id: 1, name: 'Bug', color: '#FF0000', icon: 'BugReport' };

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('getTaskTypes returns the list', async () => {
    (taskTypeModel.getTaskTypes as jest.Mock).mockResolvedValue([row]);
    await taskTypeController.getTaskTypes(
      req as Request,
      res as Response,
      pool,
    );
    expect(res.json).toHaveBeenCalledWith([row]);
  });

  it('propagates model errors', async () => {
    (taskTypeModel.getTaskTypes as jest.Mock).mockRejectedValue(
      new Error('db'),
    );
    await expect(
      taskTypeController.getTaskTypes(req as Request, res as Response, pool),
    ).rejects.toThrow('db');
  });

  describe('getTaskTypeById', () => {
    it('returns the type', async () => {
      req.params = { id: '1' };
      (taskTypeModel.getTaskTypeById as jest.Mock).mockResolvedValue(row);
      await taskTypeController.getTaskTypeById(
        req as Request,
        res as Response,
        pool,
      );
      expect(res.json).toHaveBeenCalledWith(row);
    });

    it('returns 404 when missing', async () => {
      req.params = { id: '9' };
      (taskTypeModel.getTaskTypeById as jest.Mock).mockResolvedValue(null);
      await taskTypeController.getTaskTypeById(
        req as Request,
        res as Response,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createTaskType', () => {
    it('defaults the icon to TaskAlt and active to true', async () => {
      req.body = { name: 'Bug', color: '#FF0000', description: '' };
      (taskTypeModel.createTaskType as jest.Mock).mockResolvedValue(row);
      await taskTypeController.createTaskType(
        req as Request,
        res as Response,
        pool,
      );
      expect(taskTypeModel.createTaskType).toHaveBeenCalledWith(pool, {
        name: 'Bug',
        description: null,
        color: '#FF0000',
        icon: 'TaskAlt',
        active: true,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(row);
    });

    it.each([
      [{ color: '#FF0000' }],
      [{ name: 'Bug' }],
      [{ name: 'Bug', color: 'red' }],
      [{ name: 'Bug', color: '#FF0000', icon: 'Nope' }],
    ])('rejects %j with 400', async (body) => {
      req.body = body;
      await taskTypeController.createTaskType(
        req as Request,
        res as Response,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(taskTypeModel.createTaskType).not.toHaveBeenCalled();
    });
  });

  describe('updateTaskType', () => {
    it('forwards only the sent fields', async () => {
      req.params = { id: '1' };
      req.body = { color: '#00FF00', active: false };
      (taskTypeModel.updateTaskType as jest.Mock).mockResolvedValue(row);
      await taskTypeController.updateTaskType(
        req as Request,
        res as Response,
        pool,
      );
      expect(taskTypeModel.updateTaskType).toHaveBeenCalledWith(pool, '1', {
        color: '#00FF00',
        active: false,
      });
      expect(res.json).toHaveBeenCalledWith(row);
    });

    it('replaces a cleared icon with the default', async () => {
      req.params = { id: '1' };
      req.body = { icon: '' };
      (taskTypeModel.updateTaskType as jest.Mock).mockResolvedValue(row);
      await taskTypeController.updateTaskType(
        req as Request,
        res as Response,
        pool,
      );
      expect(taskTypeModel.updateTaskType).toHaveBeenCalledWith(pool, '1', {
        icon: 'TaskAlt',
      });
    });

    it('rejects an invalid color with 400', async () => {
      req.params = { id: '1' };
      req.body = { color: 'blue' };
      await taskTypeController.updateTaskType(
        req as Request,
        res as Response,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(taskTypeModel.updateTaskType).not.toHaveBeenCalled();
    });

    it('returns 404 when missing', async () => {
      req.params = { id: '9' };
      req.body = { name: 'X' };
      (taskTypeModel.updateTaskType as jest.Mock).mockResolvedValue(null);
      await taskTypeController.updateTaskType(
        req as Request,
        res as Response,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteTaskType', () => {
    it('deletes the type', async () => {
      req.params = { id: '1' };
      (taskTypeModel.deleteTaskType as jest.Mock).mockResolvedValue(row);
      await taskTypeController.deleteTaskType(
        req as Request,
        res as Response,
        pool,
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Task type deleted successfully',
      });
    });

    it('returns 404 when missing', async () => {
      req.params = { id: '9' };
      (taskTypeModel.deleteTaskType as jest.Mock).mockResolvedValue(null);
      await taskTypeController.deleteTaskType(
        req as Request,
        res as Response,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  it('getAvailableIcons returns the icon list', () => {
    taskTypeController.getAvailableIcons(req as Request, res as Response);
    expect(res.json).toHaveBeenCalledWith(AVAILABLE_ICONS);
  });
});
