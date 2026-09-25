/**
 * True for in-app paths like `/tasks/1`. Rejects protocol-relative (`//host`),
 * backslash tricks (`/\host`) and absolute URLs.
 */
export const isSafeRelativePath = (
  value: string | null | undefined,
): value is string =>
  typeof value === 'string' &&
  value.startsWith('/') &&
  !value.startsWith('//') &&
  !value.includes('\\') &&
  !Array.from(value).some((ch) => ch.charCodeAt(0) < 32);

/**
 * Returns `value` when it is a safe in-app path, otherwise `fallback`.
 */
export const getSafeNextPath = (
  value: string | null | undefined,
  fallback = '/',
): string => (isSafeRelativePath(value) ? value : fallback);

/**
 * Returns the URL when it is https or same-origin (including relative paths),
 * otherwise undefined so callers can fall back to initials.
 */
export const getSafeImageUrl = (
  value: string | null | undefined,
): string | undefined => {
  if (!value) return undefined;
  try {
    const url = new URL(value, window.location.origin);
    if (url.protocol === 'https:' || url.origin === window.location.origin) {
      return url.href;
    }
  } catch {
    return undefined;
  }
  return undefined;
};
