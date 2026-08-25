import { Pool } from 'pg';
import * as watcherModel from '../watcherModel';

// Helper to create mock query result
const mockQueryResult = (rows: any[]) => ({ rows, rowCount: rows.length, command: '', oid: 0, fields: [] });

describe('WatcherModel', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('getTaskWatchers', () => {
    it('should return task watchers', async () => {
      const mockWatchers = [{ task_id: '1', user_id: '1', name: 'User 1' }];
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(mockWatchers));

      const result = await watcherModel.getTaskWatchers(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('get_task_watchers'),
        ['1']
      );
      expect(result).toEqual(mockWatchers);
    });
  });

  describe('addTaskWatcher', () => {
    it('should add a task watcher', async () => {
      const mockWatcher = { task_id: '1', user_id: '2' };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockWatcher]));

      const result = await watcherModel.addTaskWatcher(mockPool, '1', '2');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO watchers'),
        ['1', '2']
      );
      expect(result).toEqual(mockWatcher);
    });

    it('should return null when insert fails', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await watcherModel.addTaskWatcher(mockPool, '1', '2');

      expect(result).toBeNull();
    });
  });

  describe('removeTaskWatcher', () => {
    it('should remove a task watcher', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const result = await watcherModel.removeTaskWatcher(mockPool, '1', '2');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM watchers'),
        ['1', '2']
      );
      expect(result).toBe(1);
    });

    it('should return 0 when watcher not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const result = await watcherModel.removeTaskWatcher(mockPool, '1', '999');

      expect(result).toBe(0);
    });
  });
});
