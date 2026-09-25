import { api } from '../api';
import { AppSettings } from '../../types/setting';
import {
  getWelcomeMessage,
  getSystemSettings,
  updateSystemSettings,
  getAppTheme,
  testSmtpConnection,
} from '../settings';

// Mock the api module
jest.mock('../api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Settings API', () => {
  // Mock data
  const mockAppSettings: AppSettings = {
    id: 1,
    app_name: 'Test App',
    company_name: 'Test Company',
    sender_email: 'test@example.com',
    time_zone: 'UTC',
    theme: 'light',
    welcome_message: 'Welcome to Test App',
    app_base_url: 'http://localhost:3000',
    log_level: 'info',
    email_enabled: false,
    email_host: 'smtp.example.com',
    email_port: 587,
    email_secure: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWelcomeMessage', () => {
    it('should fetch the welcome message from /settings/welcome', async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: { welcome_message: 'Hi' },
      });

      const result = await getWelcomeMessage();

      expect(mockedApi.get).toHaveBeenCalledWith('/settings/welcome', {
        signal: undefined,
      });
      expect(result).toEqual({ welcome_message: 'Hi' });
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Network error');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(getWelcomeMessage()).rejects.toThrow(error);
    });
  });

  describe('getSystemSettings', () => {
    it('should fetch system settings successfully', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: mockAppSettings });

      const result = await getSystemSettings();

      expect(mockedApi.get).toHaveBeenCalledWith('/settings/app_settings', {
        signal: undefined,
      });
      expect(result).toEqual(mockAppSettings);
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Network error');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(getSystemSettings()).rejects.toThrow(error);
    });
  });

  describe('updateSystemSettings', () => {
    it('should update system settings successfully', async () => {
      mockedApi.put.mockResolvedValueOnce({ data: null });

      await updateSystemSettings(mockAppSettings);

      expect(mockedApi.put).toHaveBeenCalledWith(
        '/settings/app_settings',
        mockAppSettings,
      );
    });

    it('should throw error when update fails', async () => {
      const error = new Error('Update failed');
      mockedApi.put.mockRejectedValueOnce(error);

      await expect(updateSystemSettings(mockAppSettings)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getAppTheme', () => {
    it('should fetch app theme successfully', async () => {
      const mockTheme = { theme: 'dark' };
      mockedApi.get.mockResolvedValueOnce({ data: mockTheme });

      const result = await getAppTheme();

      expect(mockedApi.get).toHaveBeenCalledWith('/settings/app_theme');
      expect(result).toEqual(mockTheme);
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Network error');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(getAppTheme()).rejects.toThrow(error);
    });
  });

  describe('testSmtpConnection', () => {
    it('should return the SMTP test result', async () => {
      const smtpResult = { success: true, message: 'Connection successful' };
      mockedApi.post.mockResolvedValueOnce({ data: smtpResult });

      await expect(testSmtpConnection('admin@example.com')).resolves.toEqual(
        smtpResult,
      );
      expect(mockedApi.post).toHaveBeenCalledWith('/settings/test-smtp', {
        email: 'admin@example.com',
      });
    });

    it('should throw error when the SMTP test fails', async () => {
      const error = new Error('SMTP unavailable');
      mockedApi.post.mockRejectedValueOnce(error);

      await expect(testSmtpConnection('admin@example.com')).rejects.toThrow(
        error,
      );
    });
  });
});
