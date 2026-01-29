import { Pool } from 'pg';
import * as profileModel from '../profileModel';

// Mock the pg module
jest.mock('pg', () => ({
  Pool: jest.fn()
}));

describe('ProfileModel', () => {
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

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockProfile = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        name: 'Test',
        surname: 'User',
        role_id: 1,
        role_name: 'Admin',
        created_on: new Date(),
        updated_on: new Date()
      };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockProfile]));

      const result = await profileModel.getProfile(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT *'),
        ['1']
      );
      expect(result).toEqual(mockProfile);
    });

    it('should return null when profile not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await profileModel.getProfile(mockPool, '999');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updatedProfile = {
        id: 1,
        login: 'testuser',
        email: 'newemail@example.com',
        name: 'Updated',
        surname: 'Name',
        role_id: 1,
        created_on: new Date(),
        updated_on: new Date()
      };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([updatedProfile]));

      const result = await profileModel.updateProfile(mockPool, '1', {
        email: 'newemail@example.com',
        name: 'Updated',
        surname: 'Name'
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        ['newemail@example.com', 'Updated', 'Name', '1']
      );
      expect(result).toEqual(updatedProfile);
    });

    it('should return null when profile not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await profileModel.updateProfile(mockPool, '999', {
        email: 'test@example.com',
        name: 'Test',
        surname: 'User'
      });

      expect(result).toBeNull();
    });
  });

  describe('verifyPassword', () => {
    it('should return true when password is correct', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([{ exists: true }]));

      const result = await profileModel.verifyPassword(mockPool, '1', 'correctpassword');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT EXISTS[\s\S]*FROM users[\s\S]*WHERE id = \$1 AND password = crypt\(\$2, password\)/),
        ['1', 'correctpassword']
      );
      expect(result).toBe(true);
    });

    it('should return false when password is incorrect', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([{ exists: false }]));

      const result = await profileModel.verifyPassword(mockPool, '1', 'wrongpassword');

      expect(result).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const updatedUser = {
        id: 1,
        login: 'testuser',
        email: 'test@example.com',
        name: 'Test',
        surname: 'User',
        updated_on: new Date()
      };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([updatedUser]));

      const result = await profileModel.changePassword(mockPool, '1', 'newpassword');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        ['newpassword', '1']
      );
      expect(result).toEqual(updatedUser);
    });

    it('should return null when user not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await profileModel.changePassword(mockPool, '999', 'newpassword');

      expect(result).toBeNull();
    });
  });

  describe('getRecentTasks', () => {
    it('should return recent tasks for user', async () => {
      const mockTasks = [
        {
          id: 1,
          name: 'Task 1',
          project_id: 1,
          status_id: 1,
          created_on: new Date()
        },
        {
          id: 2,
          name: 'Task 2',
          project_id: 1,
          status_id: 2,
          created_on: new Date()
        }
      ];
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(mockTasks));

      const result = await profileModel.getRecentTasks(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM recent_tasks($1)',
        ['1']
      );
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array when no recent tasks', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await profileModel.getRecentTasks(mockPool, '1');

      expect(result).toEqual([]);
    });
  });

  describe('getRecentProjects', () => {
    it('should return recent projects for user', async () => {
      const mockProjects = [
        {
          id: 1,
          name: 'Project 1',
          status_id: 1,
          created_on: new Date()
        },
        {
          id: 2,
          name: 'Project 2',
          status_id: 1,
          created_on: new Date()
        }
      ];
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(mockProjects));

      const result = await profileModel.getRecentProjects(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM recent_projects($1)',
        ['1']
      );
      expect(result).toEqual(mockProjects);
    });

    it('should return empty array when no recent projects', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await profileModel.getRecentProjects(mockPool, '1');

      expect(result).toEqual([]);
    });
  });
});
