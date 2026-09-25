import { Pool } from 'pg';
import * as settingsModel from '../settingsModel';

// Helper to create mock query result
const mockQueryResult = (rows: any[]) => ({
  rows,
  rowCount: rows.length,
  command: '',
  oid: 0,
  fields: [],
});

describe('SettingsModel', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('getSystemSettings', () => {
    it('should return system settings', async () => {
      const mockSettings = { id: 1, app_name: 'Test App', theme: 'dark' };
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult([mockSettings]),
      );

      const result = await settingsModel.getSystemSettings(mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        `SELECT * FROM app_settings WHERE id = 1`,
      );
      expect(result).toEqual(mockSettings);
    });

    it('should return null when no settings found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));

      const result = await settingsModel.getSystemSettings(mockPool);

      expect(result).toBeNull();
    });
  });

  describe('getWelcomeMessage', () => {
    it('returns the stored message', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult([{ welcome_message: 'Hello' }]),
      );
      await expect(settingsModel.getWelcomeMessage(mockPool)).resolves.toBe(
        'Hello',
      );
    });

    it('returns an empty string without a settings row', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([]));
      await expect(settingsModel.getWelcomeMessage(mockPool)).resolves.toBe('');
    });
  });

  describe('updateSystemSettings', () => {
    it('should update system settings', async () => {
      const mockSettings = { id: 1, app_name: 'Updated App' };
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult([mockSettings]),
      );

      const result = await settingsModel.updateSystemSettings(mockPool, {
        app_name: 'Updated App',
        company_name: 'Company',
        sender_email: 'email@test.com',
        time_zone: 'UTC',
        theme: 'light',
        welcome_message: 'Welcome',
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE app_settings'),
        expect.any(Array),
      );
      expect(result).toEqual(mockSettings);
    });
  });

  describe('getUserSettings', () => {
    it('should return user settings', async () => {
      const mockSettings = { user_id: '1', theme: 'dark' };
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult([mockSettings]),
      );

      const result = await settingsModel.getUserSettings(mockPool, '1');

      expect(mockPool.query).toHaveBeenCalledWith(
        `SELECT * FROM user_settings WHERE user_id = $1`,
        ['1'],
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
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult([mockSettings]),
      );

      const result = await settingsModel.updateUserSettings(mockPool, '1', {
        theme: 'light',
        language: 'en',
        notifications_enabled: true,
        email_notifications: true,
      });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT (user_id) DO UPDATE'),
        ['1', 'light', 'en', true, true],
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('email_notifications_enabled'),
        expect.any(Array),
      );
      expect(result).toEqual(mockSettings);
    });

    it('should pass null for omitted fields so stored values survive', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult([{}]));

      await settingsModel.updateUserSettings(mockPool, '1', { theme: 'dark' });

      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
        '1',
        'dark',
        null,
        null,
        null,
      ]);
    });
  });

  describe('getTimezones', () => {
    const rows = [{ name: 'Europe/Zagreb' }, { name: 'America/New_York' }];

    beforeEach(() => {
      settingsModel._clearTimezoneCacheForTest();
      (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult(rows));
    });

    it('computes offsets for the given instant', async () => {
      const winter = await settingsModel.getTimezones(
        mockPool,
        new Date('2026-01-15T12:00:00Z'),
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        `SELECT name FROM pg_timezone_names WHERE name LIKE '%/%' ORDER BY name`,
      );
      expect(winter[0]).toMatchObject({
        name: 'Europe/Zagreb',
        region: 'Europe',
        utcOffsetSeconds: 3600,
        isDst: false,
        label: 'Europe/Zagreb (UTC+01:00)',
      });
      expect(winter[1]).toMatchObject({
        utcOffsetSeconds: -5 * 3600,
        isDst: false,
        label: 'America/New_York (UTC-05:00)',
      });
    });

    it('reflects DST from cached names without re-querying', async () => {
      await settingsModel.getTimezones(
        mockPool,
        new Date('2026-01-15T12:00:00Z'),
      );
      const summer = await settingsModel.getTimezones(
        mockPool,
        new Date('2026-07-15T12:00:00Z'),
      );

      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(summer[0]).toMatchObject({ utcOffsetSeconds: 7200, isDst: true });
      expect(summer[1]).toMatchObject({
        utcOffsetSeconds: -4 * 3600,
        isDst: true,
        abbrev: 'EDT',
      });
    });

    it('skips zones Intl does not know', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue(
        mockQueryResult([{ name: 'Not/AZone' }]),
      );

      await expect(settingsModel.getTimezones(mockPool)).resolves.toEqual([]);
    });
  });
});
