import { Pool } from 'pg';
import * as adminModel from '../adminModel';

// Mock the pg module
jest.mock('pg', () => ({
  Pool: jest.fn()
}));

describe('AdminModel', () => {
  let mockPool: jest.Mocked<Pool>;

  const mockQueryResult = (rows: any[]) => ({
    rows,
    rowCount: rows.length,
    command: '',
    oid: 0,
    fields: []
  });

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('isUserAdmin', () => {
    it('should return true when user is admin', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([{ is_admin: true }]));

      const result = await adminModel.isUserAdmin(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT is_admin($1)',
        ['1']
      );
      expect(result).toBe(true);
    });

    it('should return false when user is not admin', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([{ is_admin: false }]));

      const result = await adminModel.isUserAdmin(mockPool, '2');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT is_admin($1)',
        ['2']
      );
      expect(result).toBe(false);
    });
  });

  describe('getSystemStats', () => {
    it('should return system statistics', async () => {
      const mockStats = {
        total_users: 100,
        total_projects: 50,
        total_tasks: 500,
        total_time_logged: 10000
      };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockStats]));

      const result = await adminModel.getSystemStats(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM v_system_stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('getSystemLogs', () => {
    const mockLogs = [
      {
        id: 1,
        user_id: 1,
        user_login: 'user1',
        activity_type_id: 1,
        activity_name: 'login',
        description: 'User logged in',
        created_on: new Date()
      },
      {
        id: 2,
        user_id: 2,
        user_login: 'user2',
        activity_type_id: 2,
        activity_name: 'logout',
        description: 'User logged out',
        created_on: new Date()
      }
    ];

    it('should return system logs with date range', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(mockLogs));

      const result = await adminModel.getSystemLogs(mockPool, '2025-01-01', '2025-01-31');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT tl.*'),
        ['2025-01-01', '2025-01-31']
      );
      expect(result).toEqual(mockLogs);
    });

    it('should return system logs with date range and type filter', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockLogs[0]]));

      const result = await adminModel.getSystemLogs(mockPool, '2025-01-01', '2025-01-31', '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND tl.activity_type_id = $3'),
        ['2025-01-01', '2025-01-31', '1']
      );
      expect(result).toEqual([mockLogs[0]]);
    });

    it('should use default dates when not provided', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(mockLogs));

      const result = await adminModel.getSystemLogs(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT tl.*'),
        ['1970-01-01', 'NOW()']
      );
      expect(result).toEqual(mockLogs);
    });
  });

  describe('getAllPermissions', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [
        { id: 1, name: 'Create projects' },
        { id: 2, name: 'Delete projects' },
        { id: 3, name: 'Manage users' }
      ];
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(mockPermissions));

      const result = await adminModel.getAllPermissions(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id')
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
