import { Pool } from 'pg';
import * as loginModel from '../loginModel';

// Helper to create mock query result
const mockQueryResult = (rows: any[]) => ({ rows, rowCount: rows.length, command: '', oid: 0, fields: [] });

describe('LoginModel', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return user data on successful authentication', async () => {
      const mockUser = { id: '1', login: 'testuser', name: 'Test', role_id: 1 };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockUser]));

      const result = await loginModel.login(mockPool, 'testuser', 'password123');

      expect(mockPool.query).toHaveBeenCalledWith(
        `SELECT * FROM authentification($1, $2)`,
        ['testuser', 'password123']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when authentication fails', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await loginModel.login(mockPool, 'testuser', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should throw error on database failure', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      await expect(loginModel.login(mockPool, 'testuser', 'password'))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('app_logins', () => {
    it('should insert a login record', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      await loginModel.app_logins(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        `INSERT INTO app_logins (user_id)
    VALUES ($1)`,
        ['1']
      );
    });

    it('should throw error on database failure', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Insert failed'));

      await expect(loginModel.app_logins(mockPool, '1'))
        .rejects.toThrow('Insert failed');
    });
  });
});
