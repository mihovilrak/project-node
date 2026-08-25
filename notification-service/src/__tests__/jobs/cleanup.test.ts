import { Pool, QueryResult } from 'pg';

describe('Cleanup Job', () => {
  // Create mock functions
  let mockQuery: jest.Mock;
  let mockLogger: { info: jest.Mock; error: jest.Mock; warn: jest.Mock };
  let mockScheduleJob: jest.Mock;
  let cleanupFunction: () => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Setup mocks
    mockQuery = jest.fn();
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
    mockScheduleJob = jest.fn();

    // Mock modules before importing cleanup
    jest.doMock('../../db', () => ({
      pool: { query: mockQuery },
    }));

    jest.doMock('../../utils/logger', () => ({
      logger: mockLogger,
    }));

    jest.doMock('node-schedule', () => ({
      scheduleJob: mockScheduleJob,
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('scheduleJob registration', () => {
    it('should register cleanup job with correct cron expression', async () => {
      await import('../../jobs/cleanup');

      expect(mockScheduleJob).toHaveBeenCalledWith(
        '0 2 * * *',
        expect.any(Function)
      );
    });

    it('should schedule job to run at 2 AM daily', async () => {
      await import('../../jobs/cleanup');

      const cronExpression = mockScheduleJob.mock.calls[0][0];
      expect(cronExpression).toBe('0 2 * * *');
    });
  });

  describe('cleanupOldNotifications function', () => {
    beforeEach(async () => {
      await import('../../jobs/cleanup');
      cleanupFunction = mockScheduleJob.mock.calls[0][1];
    });

    it('should execute cleanup query', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 5 });

      await cleanupFunction();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notifications')
      );
    });

    it('should update old read notifications to inactive', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 10 });

      await cleanupFunction();

      const queryCall = mockQuery.mock.calls[0][0];
      expect(queryCall).toContain('active = false');
      expect(queryCall).toContain('30 days');
      expect(queryCall).toMatch(/read_on IS NOT NULL|is_read = true/);
    });

    it('should log number of cleaned up notifications', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 15 });

      await cleanupFunction();

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ rowCount: 15 }),
        'Cleaned up old notifications'
      );
    });

    it('should handle cleanup with zero results', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      await cleanupFunction();

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ rowCount: 0 }),
        'Cleaned up old notifications'
      );
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockQuery.mockRejectedValueOnce(dbError);

      // Should not throw
      await expect(cleanupFunction()).resolves.not.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({ err: dbError }),
        'Error cleaning up notifications'
      );
    });

    it('should only clean notifications older than 30 days', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 3 });

      await cleanupFunction();

      const queryCall = mockQuery.mock.calls[0][0];
      expect(queryCall).toMatch(/30 days/i);
    });

    it('should only clean read notifications (read_on or is_read)', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 7 });

      await cleanupFunction();

      const queryCall = mockQuery.mock.calls[0][0];
      expect(queryCall).toMatch(/read_on IS NOT NULL|is_read = true/);
    });
  });

  describe('cron expression', () => {
    it('should use correct minute (0)', async () => {
      await import('../../jobs/cleanup');
      
      const cronParts = mockScheduleJob.mock.calls[0][0].split(' ');
      expect(cronParts[0]).toBe('0'); // minute
    });

    it('should use correct hour (2)', async () => {
      await import('../../jobs/cleanup');
      
      const cronParts = mockScheduleJob.mock.calls[0][0].split(' ');
      expect(cronParts[1]).toBe('2'); // hour
    });

    it('should run every day (*)', async () => {
      await import('../../jobs/cleanup');
      
      const cronParts = mockScheduleJob.mock.calls[0][0].split(' ');
      expect(cronParts[2]).toBe('*'); // day of month
      expect(cronParts[3]).toBe('*'); // month
      expect(cronParts[4]).toBe('*'); // day of week
    });
  });
});
