import { Pool } from 'pg';
import {
  Settings,
  SettingsUpdateInput,
  UserSettingsUpdateInput,
} from '../types/settings';

interface DbTimezoneRow {
  name: string;
  abbrev: string;
  utc_offset: string;
  is_dst: boolean;
}

export interface Timezone {
  name: string;
  region: string;
  abbrev: string;
  utcOffsetSeconds: number;
  isDst: boolean;
  label: string;
}

interface TimezoneCache {
  expiresAt: number;
  data: Timezone[];
}

const TIMEZONE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
let timezoneCache: TimezoneCache | null = null;

/** Clears timezone cache (for tests only). */
export const _clearTimezoneCacheForTest = (): void => {
  timezoneCache = null;
};

/**
 * Retrieve the application-wide settings record.
 *
 * Queries the app_settings table for the singleton settings row (id = 1). Returns null if no settings record exists.
 * @param pool Database connection pool
 * @returns Promise resolving to the Settings object or null if not found
 */
export const getSystemSettings = async (
  pool: Pool,
): Promise<Settings | null> => {
  const result = await pool.query(`SELECT * FROM app_settings WHERE id = 1`);
  return result.rows[0] || null;
};

/**
 * Persist application settings to the database, updating only the provided fields while preserving existing values.
 *
 * Omitted fields retain their current database values. All columns are NOT NULL; callers may send a subset of settings (the general form and runtime panel post separately). The update targets the singleton settings row (id = 1) and returns the complete updated record or null if no row exists.
 * @param pool Database connection pool for executing the update query.
 * @param settings Partial settings object containing only the fields to update; unspecified properties are ignored.
 * @returns The updated settings record with all fields populated, or null if the settings row does not exist.
 */
export const updateSystemSettings = async (
  pool: Pool,
  settings: SettingsUpdateInput,
): Promise<Settings | null> => {
  // Every column is NOT NULL and callers may send a subset (the general form and
  // the runtime panel post separately), so an omitted field keeps its value.
  const result = await pool.query(
    `UPDATE app_settings
     SET (app_name, company_name, sender_email, time_zone, theme, welcome_message,
          app_base_url, log_level, email_enabled, email_host, email_port, email_secure, updated_on)
        = (
          COALESCE($1, app_name),
          COALESCE($2, company_name),
          COALESCE($3, sender_email),
          COALESCE($4, time_zone),
          COALESCE($5, theme),
          COALESCE($6, welcome_message),
          COALESCE($7, app_base_url),
          COALESCE($8, log_level),
          COALESCE($9, email_enabled),
          COALESCE($10, email_host),
          COALESCE($11, email_port),
          COALESCE($12, email_secure),
          CURRENT_TIMESTAMP
        )
     WHERE id = 1
     RETURNING *`,
    [
      settings.app_name ?? null,
      settings.company_name ?? null,
      settings.sender_email ?? null,
      settings.time_zone ?? null,
      settings.theme ?? null,
      settings.welcome_message ?? null,
      settings.app_base_url ?? null,
      settings.log_level ?? null,
      settings.email_enabled ?? null,
      settings.email_host ?? null,
      settings.email_port ?? null,
      settings.email_secure ?? null,
    ],
  );
  return result.rows[0] || null;
};

// Get User Settings
export const getUserSettings = async (
  pool: Pool,
  userId: string,
): Promise<Settings | null> => {
  const result = await pool.query(
    `SELECT * FROM user_settings WHERE user_id = $1`,
    [userId],
  );
  return result.rows[0] || null;
};

/**
 * Persist or update user-specific settings with fallback to existing values for omitted fields.
 *
 * All settings columns are NOT NULL; omitted fields retain their stored value or use column defaults on first write. Email notification settings support both email_notifications_enabled and email_notifications keys for compatibility.
 * @param pool Database connection pool
 * @param userId Unique identifier for the user
 * @param settings Partial settings object with optional theme, language, and notification preferences
 */
export const updateUserSettings = async (
  pool: Pool,
  userId: string,
  settings: UserSettingsUpdateInput,
): Promise<Settings | null> => {
  const { theme, language, notifications_enabled } = settings;
  const emailNotifications =
    settings.email_notifications_enabled ?? settings.email_notifications;
  // Every column is NOT NULL, so an omitted field must fall back to the stored
  // value (or the column default on first write) rather than be set to NULL.
  const result = await pool.query(
    `INSERT INTO user_settings (user_id, theme, language, notifications_enabled, email_notifications_enabled)
     VALUES (
       $1,
       COALESCE($2, 'light'),
       COALESCE($3, 'en'),
       COALESCE($4, true),
       COALESCE($5, true)
     )
     ON CONFLICT (user_id) DO UPDATE
     SET (theme, language, notifications_enabled, email_notifications_enabled, updated_on)
        = (
          COALESCE($2, user_settings.theme),
          COALESCE($3, user_settings.language),
          COALESCE($4, user_settings.notifications_enabled),
          COALESCE($5, user_settings.email_notifications_enabled),
          CURRENT_TIMESTAMP
        )
     RETURNING *`,
    [
      userId,
      theme ?? null,
      language ?? null,
      notifications_enabled ?? null,
      emailNotifications ?? null,
    ],
  );
  return result.rows[0] || null;
};

function parseIntervalToSeconds(interval: string | unknown): number {
  const raw = interval != null ? String(interval) : '';
  if (!raw) return 0;
  const trimmed = raw.trim();
  const negative = trimmed.startsWith('-');
  const value = negative ? trimmed.slice(1) : trimmed;
  const parts = value.split(':');
  if (parts.length < 2) return 0;
  const [hoursStr, minutesStr, secondsStr = '0'] = parts;
  const hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  const seconds = parseInt(secondsStr, 10) || 0;
  const total = hours * 3600 + minutes * 60 + seconds;
  return negative ? -total : total;
}

function formatOffsetLabel(seconds: number): string {
  const sign = seconds >= 0 ? '+' : '-';
  const abs = Math.abs(seconds);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `UTC${sign}${hh}:${mm}`;
}

/**
 * Retrieve all available timezones from the PostgreSQL pg_timezone_names view with in-memory caching.
 *
 * Queries timezones matching the pattern '%/%' (region-based names) and caches results in memory with a configurable TTL. Transforms database rows into enriched timezone objects including region, UTC offset in seconds, and formatted labels. Returns cached data if available and not expired.
 * @param pool Database connection pool for executing timezone queries.
 * @returns Array of timezone objects with name, region, abbreviation, UTC offset, DST flag, and display label.
 */
export const getTimezones = async (pool: Pool): Promise<Timezone[]> => {
  const now = Date.now();
  if (timezoneCache && timezoneCache.expiresAt > now) {
    return timezoneCache.data;
  }

  const result = await pool.query<DbTimezoneRow>(
    `SELECT name, abbrev, utc_offset, is_dst FROM pg_timezone_names WHERE name LIKE '%/%' ORDER BY name`,
  );

  const data: Timezone[] = result.rows.map((row) => {
    const region = row.name.split('/')[0] || 'Other';
    const utcOffsetSeconds = parseIntervalToSeconds(row.utc_offset);
    const offsetLabel = formatOffsetLabel(utcOffsetSeconds);
    return {
      name: row.name,
      region,
      abbrev: row.abbrev,
      utcOffsetSeconds,
      isDst: row.is_dst,
      label: `${row.name} (${offsetLabel})`,
    };
  });

  timezoneCache = {
    data,
    expiresAt: now + TIMEZONE_TTL_MS,
  };

  return data;
};
