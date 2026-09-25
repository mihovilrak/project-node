import { Pool } from 'pg';
import {
  Settings,
  SettingsUpdateInput,
  UserSettingsUpdateInput,
} from '../types/settings';

export interface Timezone {
  name: string;
  region: string;
  abbrev: string;
  utcOffsetSeconds: number;
  isDst: boolean;
  label: string;
}

// Offsets change with DST, so only the zone names are cached.
interface TimezoneCache {
  expiresAt: number;
  names: string[];
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

export const getWelcomeMessage = async (pool: Pool): Promise<string> => {
  const result = await pool.query(
    `SELECT welcome_message FROM app_settings WHERE id = 1`,
  );
  return result.rows[0]?.welcome_message ?? '';
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
          app_base_url, log_level, email_enabled, email_host, email_port, email_secure)
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
          COALESCE($12, email_secure)
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
     SET (theme, language, notifications_enabled, email_notifications_enabled)
        = (
          COALESCE($2, user_settings.theme),
          COALESCE($3, user_settings.language),
          COALESCE($4, user_settings.notifications_enabled),
          COALESCE($5, user_settings.email_notifications_enabled)
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

// Offset in seconds of `timeZone` at `at`, or null if Intl does not know the zone.
const offsetSecondsAt = (timeZone: string, at: Date): number | null => {
  let part: string | undefined;
  try {
    part = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName')?.value;
  } catch {
    return null;
  }
  const match = /^GMT(?:([+-])(\d{2}):(\d{2}))?$/.exec(part ?? '');
  if (!match) return null;
  if (!match[1]) return 0;
  const seconds = Number(match[2]) * 3600 + Number(match[3]) * 60;
  return match[1] === '-' ? -seconds : seconds;
};

const abbrevAt = (timeZone: string, at: Date): string =>
  new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
    .formatToParts(at)
    .find((p) => p.type === 'timeZoneName')?.value ?? '';

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
 * List the region-based time zones known to PostgreSQL with their current offset.
 *
 * Only the zone names are cached; offsets, abbreviations and DST flags are computed per call so they stay correct across DST changes.
 * @param pool Database connection pool for executing timezone queries.
 * @param now Instant the offsets are computed for (defaults to the current time).
 * @returns Array of timezone objects with name, region, abbreviation, UTC offset, DST flag, and display label.
 */
export const getTimezones = async (
  pool: Pool,
  now: Date = new Date(),
): Promise<Timezone[]> => {
  if (!timezoneCache || timezoneCache.expiresAt <= Date.now()) {
    const result = await pool.query<{ name: string }>(
      `SELECT name FROM pg_timezone_names WHERE name LIKE '%/%' ORDER BY name`,
    );
    timezoneCache = {
      names: result.rows.map((row) => row.name),
      expiresAt: Date.now() + TIMEZONE_TTL_MS,
    };
  }

  const year = now.getUTCFullYear();
  const january = new Date(Date.UTC(year, 0, 1));
  const july = new Date(Date.UTC(year, 6, 1));

  return timezoneCache.names.flatMap((name) => {
    const utcOffsetSeconds = offsetSecondsAt(name, now);
    if (utcOffsetSeconds === null) return [];
    const standard = Math.min(
      offsetSecondsAt(name, january) ?? utcOffsetSeconds,
      offsetSecondsAt(name, july) ?? utcOffsetSeconds,
    );
    return [
      {
        name,
        region: name.split('/')[0] || 'Other',
        abbrev: abbrevAt(name, now),
        utcOffsetSeconds,
        isDst: utcOffsetSeconds > standard,
        label: `${name} (${formatOffsetLabel(utcOffsetSeconds)})`,
      },
    ];
  });
};
