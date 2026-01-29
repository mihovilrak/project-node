import { Pool } from 'pg';
import * as userModel from '../userModel';

// Helper to create mock query result
const mockQueryResult = (rows: any[]) => ({ rows, rowCount: rows.length, command: '', oid: 0, fields: [] });

describe('UserModel', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users without filters', async () => {
      const mockUsers = [
        { id: '1', login: 'user1', name: 'User One' },
        { id: '2', login: 'user2', name: 'User Two' }
      ];
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(mockUsers));

      const result = await userModel.getUsers(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM v_users', []);
      expect(result).toEqual(mockUsers);
    });

    it('should return filtered users with whereParams', async () => {
      const mockUsers = [{ id: '1', login: 'user1', name: 'User One', status_id: 1 }];
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(mockUsers));

      const result = await userModel.getUsers(mockPool, { whereParams: { status_id: '1' } });

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM v_users WHERE status_id = $1',
        ['1']
      );
      expect(result).toEqual(mockUsers);
    });

    it('should handle multiple filter parameters', async () => {
      const mockUsers: any[] = [];
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(mockUsers));

      await userModel.getUsers(mockPool, { whereParams: { status_id: '1', role_id: '2' } });

      expect(mockPool.query).toHaveBeenCalled();
      const query = (mockPool.query as jest.Mock).mock.calls[0][0];
      expect(query).toContain('WHERE');
      expect(query).toContain('AND');
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const mockUser = { id: '1', login: 'user1', name: 'User One' };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockUser]));

      const result = await userModel.getUserById(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM v_users WHERE id = $1',
        ['1']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await userModel.getUserById(mockPool, '999');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = { id: '1', login: 'newuser', name: 'New', surname: 'User', email: 'new@example.com', role_id: 2 };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockUser]));

      const result = await userModel.createUser(mockPool, 'newuser', 'New', 'User', 'new@example.com', 'password123', 2);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        ['newuser', 'New', 'User', 'new@example.com', 'password123', 2]
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user and return the updated user', async () => {
      const mockUser = { id: '1', login: 'user1', name: 'Updated', email: 'user1@test.com' };
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce(mockQueryResult([mockUser]));

      const result = await userModel.updateUser(mockPool, { name: 'Updated' }, '1');

      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUser);
    });

    it('should handle password update with encryption', async () => {
      const mockUser = { id: '1', login: 'user1', name: 'User 1', email: 'user1@test.com' };
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce(mockQueryResult([mockUser]));

      const result = await userModel.updateUser(mockPool, { password: 'newpassword' }, '1');

      const updateQuery = (mockPool.query as jest.Mock).mock.calls[0][0];
      expect(updateQuery).toContain('crypt');
      expect(updateQuery).toContain('gen_salt');
      expect(result).toEqual(mockUser);
    });

    it('should return user from getUserById when updates object is empty', async () => {
      const mockUser = { id: '1', login: 'user1', name: 'User One' };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockUser]));

      const result = await userModel.updateUser(mockPool, {}, '1');

      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM v_users WHERE id = $1', ['1']);
      expect(result).toEqual(mockUser);
    });

    it('should return null when no row was updated', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 0 });

      const result = await userModel.updateUser(mockPool, { name: 'Updated' }, '999');

      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe('changeUserStatus', () => {
    it('should change user status', async () => {
      const mockUser = { id: '1', status_id: 2 };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockUser]));

      const result = await userModel.changeUserStatus(mockPool, '1', 2);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [2, '1']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await userModel.changeUserStatus(mockPool, '999', 2);

      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user by setting status to 3', async () => {
      const mockUser = { id: '1', status_id: 3 };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockUser]));

      const result = await userModel.deleteUser(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET (status_id, updated_on) = (3'),
        ['1']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await userModel.deleteUser(mockPool, '999');

      expect(result).toBeNull();
    });
  });
});
