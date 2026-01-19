import { Pool } from 'pg';
import * as permissionModel from '../permissionModel';
import { Permission } from '../../types/permission';

// Helper to create mock query result
const mockQueryResult = (rows: any[]) => ({ rows, rowCount: rows.length, command: '', oid: 0, fields: [] });

describe('PermissionModel', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('getUserPermissions', () => {
    it('should return user permissions', async () => {
      const mockPermissions = [
        { user_id: '1', permission: 'Create projects' },
        { user_id: '1', permission: 'Edit projects' }
      ];
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(mockPermissions));

      const result = await permissionModel.getUserPermissions(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM get_user_permissions($1)',
        ['1']
      );
      expect(result).toEqual(mockPermissions);
    });

    it('should return empty array when user has no permissions', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await permissionModel.getUserPermissions(mockPool, '999');

      expect(result).toEqual([]);
    });
  });

  describe('hasPermission', () => {
    const testPermission: Permission = 'Create projects';

    it('should return true when user has permission', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([{ permission_check: true }]));

      const result = await permissionModel.hasPermission(mockPool, '1', testPermission);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT permission_check($1, $2)',
        ['1', testPermission]
      );
      expect(result).toBe(true);
    });

    it('should return false when user does not have permission', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([{ permission_check: false }]));

      const result = await permissionModel.hasPermission(mockPool, '1', testPermission);

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(permissionModel.hasPermission(mockPool, '1', testPermission))
        .rejects.toThrow('Database error');
    });
  });
});
