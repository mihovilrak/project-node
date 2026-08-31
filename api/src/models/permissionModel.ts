import { Pool } from 'pg';
import { Permission, UserPermission } from '../types/permission';

interface PermissionCacheEntry {
  value: boolean;
  expiresAt: number;
}

const PERMISSION_CACHE_TTL_MS = 30_000;
const MAX_PERMISSION_CACHE_ENTRIES = 10_000;
const permissionCaches = new WeakMap<
  Pool,
  Map<string, PermissionCacheEntry>
>();

const getPermissionCache = (
  pool: Pool,
): Map<string, PermissionCacheEntry> => {
  let cache = permissionCaches.get(pool);
  if (!cache) {
    cache = new Map<string, PermissionCacheEntry>();
    permissionCaches.set(pool, cache);
  }
  return cache;
};

export const invalidatePermissionCache = (
  pool: Pool,
  userId?: string,
): void => {
  if (!userId) {
    permissionCaches.delete(pool);
    return;
  }

  const cache = permissionCaches.get(pool);
  if (!cache) return;

  const prefix = `${userId}:`;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
};

// Get all permissions for a user
export const getUserPermissions = async (
  pool: Pool,
  userId: string,
): Promise<UserPermission[]> => {
  const result = await pool.query('SELECT * FROM get_user_permissions($1)', [
    userId,
  ]);
  return result.rows;
};

// Check if a user has a specific permission
export const hasPermission = async (
  pool: Pool,
  userId: string,
  requiredPermission: Permission,
): Promise<boolean> => {
  const cache = getPermissionCache(pool);
  const cacheKey = `${userId}:${requiredPermission}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) return cached.value;
  if (cached) cache.delete(cacheKey);

  const result = await pool.query('SELECT permission_check($1, $2)', [
    userId,
    requiredPermission,
  ]);

  const value = result.rows[0].permission_check;

  if (cache.size >= MAX_PERMISSION_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(cacheKey, {
    value,
    expiresAt: now + PERMISSION_CACHE_TTL_MS,
  });

  return value;
};
