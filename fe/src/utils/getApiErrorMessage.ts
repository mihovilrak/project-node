const STATUS_MESSAGES: Record<number, string> = {
  403: 'You do not have permission to perform this action',
  404: 'The requested item was not found',
  409: 'This item already exists',
};

/**
 * Extracts a user-facing error message from an unknown error (e.g. Axios
 * error). Uses type guards; does not use `any`.
 */
export function getApiErrorMessage(error: unknown, fallback?: string): string {
  const defaultFallback = 'An error occurred';
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const res = (
      error as { response?: { status?: number; data?: { error?: unknown } } }
    ).response;
    if (
      res?.data != null &&
      typeof res.data === 'object' &&
      'error' in res.data
    ) {
      const msg = (res.data as { error: unknown }).error;
      if (typeof msg === 'string') return msg;
    }
    if (res?.status != null && STATUS_MESSAGES[res.status]) {
      return STATUS_MESSAGES[res.status];
    }
  }
  if (error instanceof Error) return error.message;
  return fallback ?? defaultFallback;
}

export default getApiErrorMessage;
