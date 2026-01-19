import { Pool, QueryResult } from 'pg';
import * as timeLogModel from '../timeLogModel';

describe('TimeLogModel', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('getAllTimeLogs', () => {
    it('should return all time logs', async () => {
      const mockTimeLogs = [{ id: '1', spent_time: 2.5 }];
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockTimeLogs } as QueryResult);

      const result = await timeLogModel.getAllTimeLogs(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('v_time_logs'));
      expect(result).toEqual(mockTimeLogs);
    });
  });

  describe('createTimeLog', () => {
    it('should create a time log', async () => {
      const mockTimeLog = { id: '1', task_id: '1', user_id: '1', spent_time: 2.5 };
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockTimeLog] } as QueryResult);

      const result = await timeLogModel.createTimeLog(mockPool, '1', '1', {
        log_date: new Date(),
        spent_time: 2.5,
        description: 'Test',
        activity_type_id: 1
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO time_logs'),
        expect.any(Array)
      );
      expect(result).toEqual(mockTimeLog);
    });
  });

  describe('updateTimeLog', () => {
    it('should update a time log', async () => {
      const mockTimeLog = { id: '1', spent_time: 3.0 };
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockTimeLog] } as QueryResult);

      const result = await timeLogModel.updateTimeLog(mockPool, '1', {
        log_date: new Date(),
        spent_time: 3.0,
        description: 'Updated',
        activity_type_id: 2
      });

      expect(result).toEqual(mockTimeLog);
    });
  });

  describe('deleteTimeLog', () => {
    it('should delete a time log', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rowCount: 1 } as QueryResult);

      await timeLogModel.deleteTimeLog(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM time_logs WHERE id = $1',
        ['1']
      );
    });
  });

  describe('getUserTimeLogs', () => {
    it('should return user time logs', async () => {
      const mockTimeLogs = [{ id: '1', user_id: '1' }];
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockTimeLogs } as QueryResult);

      const result = await timeLogModel.getUserTimeLogs(mockPool, '1', {});

      expect(result).toEqual(mockTimeLogs);
    });
  });

  describe('getProjectTimeLogs', () => {
    it('should return project time logs', async () => {
      const mockTimeLogs = [{ id: '1', project_id: '1' }];
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockTimeLogs } as QueryResult);

      const result = await timeLogModel.getProjectTimeLogs(mockPool, '1', {});

      expect(result).toEqual(mockTimeLogs);
    });
  });

  describe('getProjectSpentTime', () => {
    it('should return project spent time', async () => {
      const mockSpentTime = { total_spent: 10.5 };
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockSpentTime] } as QueryResult);

      const result = await timeLogModel.getProjectSpentTime(mockPool, '1');

      expect(result).toEqual(mockSpentTime);
    });
  });

  describe('getTaskTimeLogs', () => {
    it('should return task time logs', async () => {
      const mockTimeLogs = [{ id: '1', task_id: '1' }];
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockTimeLogs } as QueryResult);

      const result = await timeLogModel.getTaskTimeLogs(mockPool, '1');

      expect(result).toEqual(mockTimeLogs);
    });
  });

  describe('getTaskSpentTime', () => {
    it('should return task spent time', async () => {
      const mockSpentTime = { total_spent: 5.5 };
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockSpentTime] } as QueryResult);

      const result = await timeLogModel.getTaskSpentTime(mockPool, '1');

      expect(result).toEqual(mockSpentTime);
    });
  });
});
