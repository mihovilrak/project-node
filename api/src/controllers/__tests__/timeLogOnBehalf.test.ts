import { Pool } from 'pg';
import { createTimeLog, updateTimeLog } from '../timeLogController';
import * as timeLogModel from '../../models/timeLogModel';
import * as accessModel from '../../models/accessModel';
import * as permissionModel from '../../models/permissionModel';

jest.mock('../../models/timeLogModel');
jest.mock('../../models/accessModel');
jest.mock('../../models/permissionModel');

const model = timeLogModel as jest.Mocked<typeof timeLogModel>;
const access = accessModel as jest.Mocked<typeof accessModel>;
const perms = permissionModel as jest.Mocked<typeof permissionModel>;

const pool = {} as Pool;

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (body: Record<string, unknown>, params = {}) =>
  ({
    params,
    query: {},
    body,
    session: { user: { id: '1' } },
  }) as any;

const baseBody = { spent_time: 2, activity_type_id: 1 };

describe('time logs on behalf of another user', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    model.createTimeLog.mockResolvedValue({ id: 5 } as any);
    model.updateTimeLog.mockResolvedValue({ id: 5 } as any);
    model.getTimeLogRef.mockResolvedValue({ taskId: '7', userId: '3' });
    perms.hasPermission.mockResolvedValue(true);
    access.isActiveUser.mockResolvedValue(true);
    access.isTaskProjectMember.mockResolvedValue(true);
  });

  describe('createTimeLog', () => {
    it('stores the log for the session user when user_id is absent', async () => {
      const res = makeRes();
      await createTimeLog(makeReq(baseBody, { taskId: '7' }), res, pool);
      expect(model.createTimeLog).toHaveBeenCalledWith(
        pool,
        '7',
        '1',
        expect.any(Object),
      );
      expect(perms.hasPermission).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('treats user_id equal to the session user as the default', async () => {
      const res = makeRes();
      await createTimeLog(
        makeReq({ ...baseBody, user_id: 1 }, { taskId: '7' }),
        res,
        pool,
      );
      expect(perms.hasPermission).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('stores the log for the target user when an admin asks', async () => {
      const res = makeRes();
      await createTimeLog(
        makeReq({ ...baseBody, user_id: 9 }, { taskId: '7' }),
        res,
        pool,
      );
      expect(perms.hasPermission).toHaveBeenCalledWith(pool, '1', 'Admin');
      expect(access.isTaskProjectMember).toHaveBeenCalledWith(pool, '7', '9');
      expect(model.createTimeLog).toHaveBeenCalledWith(
        pool,
        '7',
        '9',
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('returns 403 for a non-admin', async () => {
      perms.hasPermission.mockResolvedValue(false);
      const res = makeRes();
      await createTimeLog(
        makeReq({ ...baseBody, user_id: 9 }, { taskId: '7' }),
        res,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(403);
      expect(model.createTimeLog).not.toHaveBeenCalled();
    });

    it('returns 400 for an inactive target', async () => {
      access.isActiveUser.mockResolvedValue(false);
      const res = makeRes();
      await createTimeLog(
        makeReq({ ...baseBody, user_id: 9 }, { taskId: '7' }),
        res,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'user_id must refer to an active user',
      });
    });

    it('returns 400 when the target is not a project member', async () => {
      access.isTaskProjectMember.mockResolvedValue(false);
      const res = makeRes();
      await createTimeLog(
        makeReq({ ...baseBody, user_id: 9 }, { taskId: '7' }),
        res,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(model.createTimeLog).not.toHaveBeenCalled();
    });

    it.each(['abc', null, '', true])(
      'returns 400 for a malformed user_id (%p)',
      async (user_id) => {
        const res = makeRes();
        await createTimeLog(
          makeReq({ ...baseBody, user_id }, { taskId: '7' }),
          res,
          pool,
        );
        expect(res.status).toHaveBeenCalledWith(400);
        expect(model.createTimeLog).not.toHaveBeenCalled();
      },
    );
  });

  describe('updateTimeLog', () => {
    it('reassigns the log when an admin sends user_id', async () => {
      const res = makeRes();
      await updateTimeLog(
        makeReq({ user_id: '9' }, { timeLogId: '5' }),
        res,
        pool,
      );
      expect(access.isTaskProjectMember).toHaveBeenCalledWith(pool, '7', '9');
      expect(model.updateTimeLog).toHaveBeenCalledWith(pool, '5', {
        user_id: '9',
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 403 for a non-admin', async () => {
      perms.hasPermission.mockResolvedValue(false);
      const res = makeRes();
      await updateTimeLog(
        makeReq({ user_id: 9 }, { timeLogId: '5' }),
        res,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(403);
      expect(model.updateTimeLog).not.toHaveBeenCalled();
    });

    it('skips the owner checks when user_id is the current owner', async () => {
      access.isTaskProjectMember.mockResolvedValue(false);
      const res = makeRes();
      await updateTimeLog(
        makeReq({ user_id: 3, spent_time: 1 }, { timeLogId: '5' }),
        res,
        pool,
      );
      expect(perms.hasPermission).not.toHaveBeenCalled();
      expect(model.updateTimeLog).toHaveBeenCalledWith(pool, '5', {
        spent_time: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('checks membership when reassigning a log to the caller', async () => {
      access.isTaskProjectMember.mockResolvedValue(false);
      const res = makeRes();
      await updateTimeLog(
        makeReq({ user_id: 1 }, { timeLogId: '5' }),
        res,
        pool,
      );
      expect(access.isTaskProjectMember).toHaveBeenCalledWith(pool, '7', '1');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(model.updateTimeLog).not.toHaveBeenCalled();
    });

    it('lets a non-admin claim a log without the admin check', async () => {
      perms.hasPermission.mockResolvedValue(false);
      const res = makeRes();
      await updateTimeLog(
        makeReq({ user_id: 1 }, { timeLogId: '5' }),
        res,
        pool,
      );
      expect(perms.hasPermission).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 400 when user_id is null', async () => {
      const res = makeRes();
      await updateTimeLog(
        makeReq({ user_id: null }, { timeLogId: '5' }),
        res,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(model.updateTimeLog).not.toHaveBeenCalled();
    });

    it('returns 404 when the log does not exist', async () => {
      model.getTimeLogRef.mockResolvedValue(null);
      const res = makeRes();
      await updateTimeLog(
        makeReq({ user_id: 9 }, { timeLogId: '5' }),
        res,
        pool,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
