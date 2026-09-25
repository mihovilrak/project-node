import { Pool } from 'pg';
import * as taskTypeModel from '../taskTypeModel';

const mockQueryResult = (rows: unknown[]) => ({
  rows,
  rowCount: rows.length,
  command: '',
  oid: 0,
  fields: [],
});

describe('TaskTypeModel', () => {
  let mockPool: jest.Mocked<Pool>;
  const row = { id: 1, name: 'Bug', color: '#FF0000', icon: 'BugReport' };

  beforeEach(() => {
    mockPool = { query: jest.fn() } as unknown as jest.Mocked<Pool>;
  });

  it('getTaskTypes returns active types', async () => {
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([row]));
    await expect(taskTypeModel.getTaskTypes(mockPool)).resolves.toEqual([row]);
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE active = true'),
    );
  });

  it('getTaskTypeById returns the row or null', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce(mockQueryResult([row]))
      .mockResolvedValueOnce(mockQueryResult([]));
    await expect(taskTypeModel.getTaskTypeById(mockPool, '1')).resolves.toEqual(
      row,
    );
    await expect(
      taskTypeModel.getTaskTypeById(mockPool, '2'),
    ).resolves.toBeNull();
  });

  it('createTaskType inserts all fields', async () => {
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([row]));
    const input = {
      name: 'Bug',
      description: null,
      color: '#FF0000',
      icon: 'BugReport',
      active: true,
    };
    await expect(
      taskTypeModel.createTaskType(mockPool, input),
    ).resolves.toEqual(row);
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO task_types'),
      ['Bug', null, '#FF0000', 'BugReport', true],
    );
  });

  describe('updateTaskType', () => {
    it('sets only the provided columns', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([row]));
      await taskTypeModel.updateTaskType(mockPool, '1', {
        color: '#00FF00',
        active: false,
      });
      const [sql, params] = (mockPool.query as jest.Mock).mock.calls[0];
      expect(sql).toContain('SET color = $1, active = $2');
      expect(sql).toContain('WHERE id = $3');
      expect(sql).not.toContain('updated_on');
      expect(params).toEqual(['#00FF00', false, '1']);
    });

    it('returns the current row when nothing changes', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([row]));
      await expect(
        taskTypeModel.updateTaskType(mockPool, '1', {}),
      ).resolves.toEqual(row);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM task_types'),
        ['1'],
      );
    });

    it('returns null when the type does not exist', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));
      await expect(
        taskTypeModel.updateTaskType(mockPool, '9', { name: 'x' }),
      ).resolves.toBeNull();
    });
  });

  it('deleteTaskType soft-deletes active rows only', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce(mockQueryResult([row]))
      .mockResolvedValueOnce(mockQueryResult([]));
    await expect(taskTypeModel.deleteTaskType(mockPool, '1')).resolves.toEqual(
      row,
    );
    await expect(
      taskTypeModel.deleteTaskType(mockPool, '1'),
    ).resolves.toBeNull();
    const [sql, params] = (mockPool.query as jest.Mock).mock.calls[0];
    expect(sql).toContain('SET active = false');
    expect(sql).toContain('AND active = true');
    expect(params).toEqual(['1']);
  });
});
