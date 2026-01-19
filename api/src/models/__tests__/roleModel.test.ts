import { Pool, QueryResult } from 'pg';
import * as roleModel from '../roleModel';

describe('RoleModel', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('getRoles', () => {
    it('should return all roles', async () => {
      const mockRoles = [{ id: '1', name: 'Admin' }, { id: '2', name: 'User' }];
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: mockRoles } as QueryResult);

      const result = await roleModel.getRoles(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('get_roles()'));
      expect(result).toEqual(mockRoles);
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '3' }] } as QueryResult);

      const result = await roleModel.createRole(mockPool, {
        name: 'New Role',
        description: 'New role description',
        permissions: [1, 2, 3]
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT create_role($1, $2, $3, $4) as id',
        ['New Role', 'New role description', true, [1, 2, 3]]
      );
      expect(result).toBe('3');
    });

    it('should throw error on database failure', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(roleModel.createRole(mockPool, {
        name: 'New Role',
        permissions: [1]
      })).rejects.toThrow('Database error');
    });
  });

  describe('updateRole', () => {
    it('should update a role', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rowCount: 1 } as QueryResult);

      await roleModel.updateRole(mockPool, '1', {
        name: 'Updated Role',
        description: 'Updated description',
        active: true,
        permissions: [1, 2]
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT update_role($1, $2, $3, $4, $5)',
        ['1', 'Updated Role', 'Updated description', true, [1, 2]]
      );
    });

    it('should throw error on database failure', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(roleModel.updateRole(mockPool, '1', {
        name: 'Updated Role',
        permissions: [1]
      })).rejects.toThrow('Database error');
    });
  });
});
