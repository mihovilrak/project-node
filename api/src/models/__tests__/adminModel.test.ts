import { Pool } from 'pg';
import * as adminModel from '../adminModel';

// Mock the pg module
jest.mock('pg', () => ({
  Pool: jest.fn(),
}));

describe('AdminModel', () => {
  let mockPool: jest.Mocked<Pool>;

  const mockQueryResult = (rows: any[]) => ({
    rows,
    rowCount: rows.length,
    command: '',
    oid: 0,
    fields: [],
  });

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });


  describe('getSystemStats', () => {
    it('should return system statistics', async () => {
      const mockStats = {
        active_users: 100,
        active_projects: 50,
        active_tasks: 500,
        time_logs_30d: 10000,
      };
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult([mockStats]),
      );

      const result = await adminModel.getSystemStats(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM get_system_stats()',
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('getTimeLogReport', () => {
    const mockLogs = [
      {
        id: 1,
        user_id: 1,
        user_login: 'user1',
        activity_type_id: 1,
        activity_name: 'login',
        description: 'User logged in',
        created_on: new Date(),
      },
      {
        id: 2,
        user_id: 2,
        user_login: 'user2',
        activity_type_id: 2,
        activity_name: 'logout',
        description: 'User logged out',
        created_on: new Date(),
      },
    ];

    it('should return system logs with date range', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult(mockLogs),
      );

      const result = await adminModel.getTimeLogReport(
        mockPool,
        { startDate: '2025-01-01', endDate: '2025-01-31' },
        { limit: 10, offset: 5 },
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $4 OFFSET $5'),
        ['2025-01-01', '2025-01-31', null, 10, 5],
      );
      expect(result).toEqual(mockLogs);
    });

    it('should filter by activity type', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult([mockLogs[0]]),
      );

      await adminModel.getTimeLogReport(mockPool, { type: 1 });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('tl.activity_type_id = $3::integer'),
        [null, null, 1, 50, 0],
      );
    });

    it('should bind nulls and let SQL supply the date defaults', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult(mockLogs),
      );

      const result = await adminModel.getTimeLogReport(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('COALESCE($2::timestamptz, now())'),
        [null, null, null, 50, 0],
      );
      expect(result).toEqual(mockLogs);
    });
  });

  describe('getAllPermissions', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [
        { id: 1, name: 'Create projects' },
        { id: 2, name: 'Delete projects' },
        { id: 3, name: 'Manage users' },
      ];
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult(mockPermissions),
      );

      const result = await adminModel.getAllPermissions(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id'),
      );
      expect(result).toEqual(mockPermissions);
    });

    it('should return empty array when no permissions exist', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await adminModel.getAllPermissions(mockPool);

      expect(result).toEqual([]);
    });
  });
});
