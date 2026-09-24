import { api } from './api';
import { UserSettings, AppSettings, TimezoneOption } from '../types/setting';

/**
 * Fetch the current user's settings from the server, accepting an optional AbortSignal to cancel the request.
 *
 * Performs a GET request to '/settings/user_settings' and returns the server-provided UserSettings object. Several fields (timezone, language, date_format, time_format, updated_on) may be null; notification_preferences is an object of boolean flags. This function only reads settings and does not modify server state.
 * @param signal Optional AbortSignal used to cancel the in-flight network request; if already aborted the request may be terminated immediately.
 */
export const getUserSettings = async (
  signal?: AbortSignal,
): Promise<UserSettings> => {
  const response = await api.get<UserSettings>('/settings/user_settings', {
    signal,
  });
  return response.data;
};

/**
 * Send a complete UserSettings object to the backend to replace the stored settings for that user.
 *
 * Performs an HTTP PUT to /settings/user_settings with the provided UserSettings payload; the call is asynchronous and resolves when the server acknowledges the update. The settings object must include the user_id and may contain nullable fields (timezone, language, date_format, time_format) and a nested notification_preferences object. This function does not return a value and will reject on network or server errors.
 * @param settings The full UserSettings object to persist for the user. Required fields include user_id (number) and the notification_preferences object; other fields (timezone, language, date_format, time_format, created_on, updated_on) may be null as allowed by the type.
 */
export const updateUserSettings = async (
  settings: UserSettings,
): Promise<void> => {
  await api.put<void>('/settings/user_settings', settings);
};

// Get System Settings
export const getSystemSettings = async (
  signal?: AbortSignal,
): Promise<AppSettings> => {
  const response = await api.get<AppSettings>('/settings/app_settings', {
    signal,
  });
  return response.data;
};

/**
 * Send a partial AppSettings object to the server to update the application-wide system settings via PUT /settings/app_settings.
 *
 * Performs an HTTP PUT to /settings/app_settings and updates the server-side, application-wide settings. The function accepts a Partial<AppSettings> so only the provided fields will be changed; omitted fields remain unchanged. Callers must supply valid values for specific fields (for example, theme must be 'light', 'dark', or 'system'; email_port must be a number). The operation is asynchronous and resolves when the server acknowledges the update.
 * @param settings Partial<AppSettings> — object containing one or more fields from AppSettings to update (e.g. app_name, company_name, sender_email, time_zone, theme, welcome_message, app_base_url, log_level, email_enabled, email_host, email_port, email_secure). Omitted fields are left unchanged.
 */
export const updateSystemSettings = async (
  settings: Partial<AppSettings>,
): Promise<void> => {
  await api.put<void>('/settings/app_settings', settings);
};

/**
 * Fetch the current application theme setting from the server.
 *
 * Performs a GET request to '/settings/app_theme' and resolves to an object with a single property, theme, whose value is one of 'light', 'dark', or 'system'. This function has no side effects; callers may choose a fallback (for example, 'light') if the returned theme is missing or falsy.
 */
export const getAppTheme = async (): Promise<{
  theme: 'light' | 'dark' | 'system';
}> => {
  const response = await api.get<{ theme: 'light' | 'dark' | 'system' }>(
    '/settings/app_theme',
  );
  return response.data;
};

/**
 * Fetch the list of available timezones from the server.
 *
 * Performs an HTTP GET to '/settings/timezones' and resolves to an array of TimezoneOption objects. Each TimezoneOption includes: name, region, abbrev, utcOffsetSeconds, isDst, and label. The request can be cancelled by passing an AbortSignal; the returned promise will reject on network errors or if aborted.
 * @param signal Optional AbortSignal to cancel the HTTP request.
 */
export const getTimezones = async (
  signal?: AbortSignal,
): Promise<TimezoneOption[]> => {
  const response = await api.get<TimezoneOption[]>('/settings/timezones', {
    signal,
  });
  return response.data;
};

// Test SMTP Connection
export interface SmtpTestResult {
  success: boolean;
  message: string;
  messageId?: string;
}

/**
 * Ask the backend to send a test SMTP message to the specified recipient and return the result of that test.
 * @param email Recipient email address to send the test SMTP message to.
 */
export const testSmtpConnection = async (
  email: string,
): Promise<SmtpTestResult> => {
  const response = await api.post<SmtpTestResult>('/settings/test-smtp', {
    email,
  });
  return response.data;
};
