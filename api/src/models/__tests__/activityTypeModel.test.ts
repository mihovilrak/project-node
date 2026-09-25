import { Pool } from 'pg';
import * as activityTypeModel from '../activityTypeModel';

const mockQueryResult = (rows: unknown[]) => ({
  rows,
  rowCount: rows.length,
  command: '',
  oid: 0,
  fields: [],
});

describe('ActivityTypeModel', () => {
  let mockPool: jest.Mocked<Pool>;
  const row = { id: 1, name: 'Dev', color: '#000000', icon: null };

  beforeEach(() => {
    mockPool = { query: jest.fn() } as unknown as jest.Mocked<Pool>;
  });

  it('getActivityTypes returns active types', async () => {
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([row]));
    await expect(activityTypeModel.getActivityTypes(mockPool)).resolves.toEqual(
      [row],
    );
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE active = true'),
      [false],
    );
    await activityTypeModel.getActivityTypes(mockPool, true);
    expect(mockPool.query).toHaveBeenLastCalledWith(
      expect.stringContaining('OR $1'),
      [true],
    );
  });

  it('createActivityType inserts all fields', async () => {
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([row]));
    await expect(
      activityTypeModel.createActivityType(mockPool, {
        name: 'Dev',
        description: 'd',
        color: '#000000',
        icon: null,
        active: true,
      }),
    ).resolves.toEqual(row);
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO activity_types'),
      ['Dev', 'd', '#000000', null, true],
    );
  });

  describe('updateActivityType', () => {
    it('sets only the provided columns', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([row]));
      await activityTypeModel.updateActivityType(mockPool, '1', {
        name: 'New',
        icon: 'Code',
      });
      const [sql, params] = (mockPool.query as jest.Mock).mock.calls[0];
      expect(sql).toContain('SET name = $1, icon = $2');
      expect(sql).toContain('WHERE id = $3');
      expect(sql).not.toContain('updated_on');
      expect(params).toEqual(['New', 'Code', '1']);
    });

    it('can reactivate a type', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([row]));
      await activityTypeModel.updateActivityType(mockPool, '1', {
        active: true,
      });
      const [sql] = (mockPool.query as jest.Mock).mock.calls[0];
      expect(sql).toContain('SET active = $1');
      expect(sql).not.toContain('AND active');
    });

    it('returns the current row when nothing changes', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([row]));
      await expect(
        activityTypeModel.updateActivityType(mockPool, '1', {}),
      ).resolves.toEqual(row);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM activity_types'),
        ['1'],
      );
    });

    it('returns null when the type does not exist', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));
      await expect(
        activityTypeModel.updateActivityType(mockPool, '9', { name: 'x' }),
      ).resolves.toBeNull();
    });
  });

  it('deleteActivityType soft-deletes active rows only', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce(mockQueryResult([row]))
      .mockResolvedValueOnce(mockQueryResult([]));
    await expect(
      activityTypeModel.deleteActivityType(mockPool, '1'),
    ).resolves.toEqual(row);
    await expect(
      activityTypeModel.deleteActivityType(mockPool, '1'),
    ).resolves.toBeNull();
    const [sql] = (mockPool.query as jest.Mock).mock.calls[0];
    expect(sql).toContain('SET active = false');
    expect(sql).toContain('AND active = true');
  });
});
