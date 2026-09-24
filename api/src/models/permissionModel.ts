import { Pool } from 'pg';
import { Permission, UserPermission } from '../types/permission';

interface PermissionCacheEntry {
  value: boolean;
  expiresAt: number;
}

const PERMISSION_CACHE_TTL_MS = 30_000;
const MAX_PERMISSION_CACHE_ENTRIES = 10_000;
const permissionCaches = new WeakMap<Pool, Map<string, PermissionCacheEntry>>();

const getPermissionCache = (pool: Pool): Map<string, PermissionCacheEntry> => {
  let cache = permissionCaches.get(pool);
  if (!cache) {
    cache = new Map<string, PermissionCacheEntry>();
    permissionCaches.set(pool, cache);
  }
  return cache;
};

/**
 * Clear cached permissions for a specific user or all users in a connection pool.
 * @param pool Database connection pool managing the cache.
 * @param userId User identifier to invalidate; if omitted, clears all cached permissions for the pool.
 */
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

/**
 * Determine whether a user holds a specific permission, using cached results when available.
 *
 * Results are cached with a configurable TTL to reduce database queries. The cache is automatically pruned when it reaches capacity by removing the oldest entry. Expired cache entries are deleted on access.
 * @param pool Database connection pool
 * @param userId Identifier of the user to check
 * @param requiredPermission The permission to verify
 */
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
