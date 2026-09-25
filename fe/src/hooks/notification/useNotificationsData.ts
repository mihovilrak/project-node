import { useCallback, useEffect, useMemo } from 'react';
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from '../../api/notifications';
import { Notification } from '../../types/notification';
import { useAsyncResource } from '../common/useAsyncResource';
import logger from '../../utils/logger';
import getApiErrorMessage, {
  getApiErrorStatus,
} from '../../utils/getApiErrorMessage';

const EMPTY_NOTIFICATIONS: Notification[] = [];

export type NotificationsData = ReturnType<typeof useNotificationsData>;

/**
 * Load the user's notifications and poll for updates. Polling pauses while the
 * tab is hidden and refreshes immediately when it becomes visible again.
 *
 * @param userId Notifications load only when defined.
 * @param pollIntervalMs Milliseconds between refreshes; zero disables polling.
 */
export const useNotificationsData = (
  userId: number | undefined,
  pollIntervalMs: number = 60000,
) => {
  const {
    data: notifications,
    loading,
    error,
    setError,
    refetch: fetchNotifications,
  } = useAsyncResource<Notification[]>(
    async (signal) => (await getNotifications(signal)) || [],
    [userId],
    {
      initialData: EMPTY_NOTIFICATIONS,
      enabled: Boolean(userId),
      errorMessage: 'Failed to load notifications',
    },
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n?.is_read).length,
    [notifications],
  );

  useEffect(() => {
    if (!userId || pollIntervalMs <= 0) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (!interval) interval = setInterval(fetchNotifications, pollIntervalMs);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };
    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        fetchNotifications();
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [userId, pollIntervalMs, fetchNotifications]);

  const markNotificationRead = useCallback(
    async (id: number) => {
      await markAsRead(id);
      await fetchNotifications();
    },
    [fetchNotifications],
  );

  const removeNotification = useCallback(
    async (id: number) => {
      try {
        await deleteNotification(id);
        await fetchNotifications();
      } catch (err: unknown) {
        // Already gone (e.g. deleted in another tab): just resync the list.
        if (getApiErrorStatus(err) === 404) {
          await fetchNotifications();
          return;
        }
        logger.error('Failed to delete notification:', err);
        setError(getApiErrorMessage(err, 'Failed to delete notification'));
      }
    },
    [fetchNotifications, setError],
  );

  const markAllRead = useCallback(async () => {
    try {
      await markAsRead();
      await fetchNotifications();
    } catch (err: unknown) {
      logger.error('Failed to mark all notifications as read:', err);
      setError(getApiErrorMessage(err, 'Failed to mark notifications as read'));
    }
  }, [fetchNotifications, setError]);

  const clearError = useCallback(() => setError(null), [setError]);

  return {
    notifications,
    loading,
    error,
    clearError,
    unreadCount,
    fetchNotifications,
    markNotificationRead,
    removeNotification,
    markAllRead,
  };
};
