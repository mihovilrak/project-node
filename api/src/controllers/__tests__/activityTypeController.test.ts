import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as activityTypeModel from '../../models/activityTypeModel';
import * as activityTypeController from '../activityTypeController';
import { AVAILABLE_ICONS } from '../../utils/iconConstants';

jest.mock('../../models/activityTypeModel');

describe('ActivityTypeController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const pool = {} as Pool;
  const row = { id: 1, name: 'Dev', color: '#000000', icon: null };

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('getActivityTypes returns the list', async () => {
    (activityTypeModel.getActivityTypes as jest.Mock).mockResolvedValue([row]);
    await activityTypeController.getActivityTypes(
      req as Request,
      res as Response,
      pool,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([row]);
  });

  it('propagates model errors', async () => {
    (activityTypeModel.getActivityTypes as jest.Mock).mockRejectedValue(
      new Error('db'),
    );
    await expect(
      activityTypeController.getActivityTypes(
        req as Request,
        res as Response,
        pool,
      ),
    ).rejects.toThrow('db');
  });

  describe('createActivityType', () => {
    it('creates with a null icon by default', async () => {
      req.body = { name: 'Dev', color: '#000000', active: true };
      (activityTypeModel.createActivityType as jest.Mock).mockResolvedValue(
        row,
      );
      await activityTypeController.createActivityType(
        req as Request,
        res as Response,
        pool,
      );
      expect(activityTypeModel.createActivityType).toHaveBeenCalledWith(pool, {
        name: 'Dev',
        description: null,
        color: '#000000',
        icon: null,
        active: true,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(row);
    });

    it.each([
      [{ color: '#000000' }],
      [{ name: 'Dev' }],
      [{ name: 'Dev', color: '000000' }],
      [{ name: 'Dev', color: '#000000', icon: 'Nope' }],
    ])('rejects %j with 400', async (body) => {
      req.body = body;
      await activityTypeController.createActivityType(
        req as Request,
        res as Response,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(activityTypeModel.createActivityType).not.toHaveBeenCalled();
    });
  });

  describe('updateActivityType', () => {
    it('forwards only the sent fields', async () => {
      req.params = { id: '1' };
      req.body = { name: 'New', icon: '' };
      (activityTypeModel.updateActivityType as jest.Mock).mockResolvedValue(
        row,
      );
      await activityTypeController.updateActivityType(
        req as Request,
        res as Response,
        pool,
      );
      expect(activityTypeModel.updateActivityType).toHaveBeenCalledWith(
        pool,
        '1',
        { name: 'New', icon: null },
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('rejects an invalid color with 400', async () => {
      req.params = { id: '1' };
      req.body = { color: '#12' };
      await activityTypeController.updateActivityType(
        req as Request,
        res as Response,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(activityTypeModel.updateActivityType).not.toHaveBeenCalled();
    });

    it('returns 404 when missing', async () => {
      req.params = { id: '9' };
      req.body = { name: 'X' };
      (activityTypeModel.updateActivityType as jest.Mock).mockResolvedValue(
        null,
      );
      await activityTypeController.updateActivityType(
        req as Request,
        res as Response,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteActivityType', () => {
    it('deletes the type', async () => {
      req.params = { id: '1' };
      (activityTypeModel.deleteActivityType as jest.Mock).mockResolvedValue(
        row,
      );
      await activityTypeController.deleteActivityType(
        req as Request,
        res as Response,
        pool,
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Activity type deleted successfully',
      });
    });

    it('returns 404 when missing', async () => {
      req.params = { id: '9' };
      (activityTypeModel.deleteActivityType as jest.Mock).mockResolvedValue(
        null,
      );
      await activityTypeController.deleteActivityType(
        req as Request,
        res as Response,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  it('getAvailableIcons returns the icon list', () => {
    activityTypeController.getAvailableIcons(req as Request, res as Response);
    expect(res.json).toHaveBeenCalledWith(AVAILABLE_ICONS);
  });
});
