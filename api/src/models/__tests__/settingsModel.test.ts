import { Pool } from 'pg';
import * as settingsModel from '../settingsModel';

// Helper to create mock query result
const mockQueryResult = (rows: any[]) => ({ rows, rowCount: rows.length, command: '', oid: 0, fields: [] });

describe('SettingsModel', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('getSystemSettings', () => {
    it('should return system settings', async () => {
      const mockSettings = { id: 1, app_name: 'Test App', theme: 'dark' };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockSettings]));

      const result = await settingsModel.getSystemSettings(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM app_settings WHERE id = 1`);
      expect(result).toEqual(mockSettings);
    });

    it('should return null when no settings found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await settingsModel.getSystemSettings(mockPool);

      expect(result).toBeNull();
    });
  });

  describe('updateSystemSettings', () => {
    it('should update system settings', async () => {
      const mockSettings = { id: 1, app_name: 'Updated App' };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockSettings]));

      const result = await settingsModel.updateSystemSettings(mockPool, {
        app_name: 'Updated App',
        company_name: 'Company',
        sender_email: 'email@test.com',
        time_zone: 'UTC',
        theme: 'light',
        welcome_message: 'Welcome'
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE app_settings'),
        expect.any(Array)
      );
      expect(result).toEqual(mockSettings);
    });
  });

  describe('getUserSettings', () => {
    it('should return user settings', async () => {
      const mockSettings = { user_id: '1', theme: 'dark' };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockSettings]));

      const result = await settingsModel.getUserSettings(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        `SELECT * FROM user_settings WHERE user_id = $1`,
        ['1']
      );
      expect(result).toEqual(mockSettings);
    });

    it('should return null when no user settings found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await settingsModel.getUserSettings(mockPool, '999');

      expect(result).toBeNull();
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings with upsert', async () => {
      const mockSettings = { user_id: '1', theme: 'light' };
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([mockSettings]));

      const result = await settingsModel.updateUserSettings(mockPool, '1', {
        theme: 'light',
        language: 'en',
        notifications_enabled: true,
        email_notifications: true
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT (user_id) DO UPDATE'),
        expect.any(Array)
      );
      expect(result).toEqual(mockSettings);
    });
  });
});
