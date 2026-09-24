import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types/notification';
import { useNotificationsData } from './useNotificationsData';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { isSafeRelativePath } from '../../utils/urlSafety';
import logger from '../../utils/logger';

/**
 * Notification UI state (menu anchor, click/delete/mark-all handlers) on top of
 * the shared notifications poller. Falls back to a local poller when rendered
 * outside `NotificationsProvider`.
 *
 * @param userId Numeric identifier of the user; notifications load only when
 *   defined.
 * @param pollIntervalMs Milliseconds between automatic notification refresh
 *   cycles for the local fallback; disabled when zero or negative.
 */
export const useNotificationCenter = (
  userId: number | undefined,
  pollIntervalMs: number = 60000,
) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const shared = useNotificationsContext();
  const local = useNotificationsData(
    shared ? undefined : userId,
    pollIntervalMs,
  );
  const data = shared ?? local;
  const { fetchNotifications, markNotificationRead } = data;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = useCallback((): void => {
    setAnchorEl(null);
  }, []);

  const openLink = useCallback(
    (link?: string | null) => {
      if (!link) return;
      if (isSafeRelativePath(link)) navigate(link);
      else logger.warn('Ignored unsafe notification link:', link);
    },
    [navigate],
  );

  const handleNotificationClick = async (
    notification: Notification,
  ): Promise<void> => {
    if (!userId || !notification) return;
    try {
      if (!notification.is_read) {
        await markNotificationRead(notification.id);
      }
    } catch (error: unknown) {
      logger.error('Failed to handle notification click:', error);
    }
    handleClose();
    openLink(notification.link);
  };

  const handleDeleteNotification = async (
    id: number,
    event: React.MouseEvent,
  ): Promise<void> => {
    event.stopPropagation();
    if (!id) return;
    await data.removeNotification(id);
  };

  const handleMarkAllAsRead = async (): Promise<void> => {
    if (!userId) return;
    await data.markAllRead();
  };

  return {
    anchorEl,
    notifications: data.notifications,
    loading: data.loading,
    error: data.error,
    clearError: data.clearError,
    unreadCount: data.unreadCount,
    fetchNotifications,
    handleClick,
    handleClose,
    handleNotificationClick,
    handleDeleteNotification,
    handleMarkAllAsRead,
  };
};
