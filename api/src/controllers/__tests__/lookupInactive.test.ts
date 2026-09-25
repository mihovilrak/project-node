import { Pool } from 'pg';
import { getTags, updateTag } from '../tagController';
import { getTaskTypes } from '../taskTypeController';
import { getActivityTypes } from '../activityTypeController';
import * as tagModel from '../../models/tagModel';
import * as taskTypeModel from '../../models/taskTypeModel';
import * as activityTypeModel from '../../models/activityTypeModel';
import * as permissionModel from '../../models/permissionModel';

jest.mock('../../models/tagModel');
jest.mock('../../models/taskTypeModel');
jest.mock('../../models/activityTypeModel');
jest.mock('../../models/permissionModel');

const perms = permissionModel as jest.Mocked<typeof permissionModel>;
const pool = {} as Pool;

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (query: Record<string, string> = {}, body = {}) =>
  ({
    params: { id: '3' },
    query,
    body,
    session: { user: { id: '1' } },
  }) as any;

const listers = [
  ['tags', getTags, tagModel.getTags],
  ['task types', getTaskTypes, taskTypeModel.getTaskTypes],
  ['activity types', getActivityTypes, activityTypeModel.getActivityTypes],
] as const;

describe.each(listers)('GET %s include_inactive', (_name, handler, model) => {
  beforeEach(() => {
    jest.resetAllMocks();
    (model as jest.Mock).mockResolvedValue([]);
  });

  it('returns active rows only by default', async () => {
    await handler(makeReq(), makeRes(), pool);
    expect(model).toHaveBeenCalledWith(pool, false);
    expect(perms.hasPermission).not.toHaveBeenCalled();
  });

  it('includes inactive rows for an admin', async () => {
    perms.hasPermission.mockResolvedValue(true);
    await handler(makeReq({ include_inactive: 'true' }), makeRes(), pool);
    expect(perms.hasPermission).toHaveBeenCalledWith(pool, '1', 'Admin');
    expect(model).toHaveBeenCalledWith(pool, true);
  });

  it('ignores the flag for a non-admin', async () => {
    perms.hasPermission.mockResolvedValue(false);
    await handler(makeReq({ include_inactive: 'true' }), makeRes(), pool);
    expect(model).toHaveBeenCalledWith(pool, false);
  });
});

describe('PUT /tags/:id active', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (tagModel.updateTag as jest.Mock).mockResolvedValue({ id: 3 });
  });

  it('forwards active: true to reactivate a tag', async () => {
    const res = makeRes();
    await updateTag(makeReq({}, { active: true }), res, pool);
    expect(tagModel.updateTag).toHaveBeenCalledWith(pool, '3', {
      active: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects a non-boolean active', async () => {
    const res = makeRes();
    await updateTag(makeReq({}, { active: 'yes' }), res, pool);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(tagModel.updateTag).not.toHaveBeenCalled();
  });
});
