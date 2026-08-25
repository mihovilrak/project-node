import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  markAsRead,
  deleteNotification
} from '../../api/notifications';
import { Notification } from '../../types/notification';
import logger from '../../utils/logger';

export const useNotificationCenter = (
  userId: number | undefined,
  pollIntervalMs: number = 60000
) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();

  const fetchNotifications = async (): Promise<void> => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await getNotifications(userId);
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n?.is_read).length);
    } catch (error: unknown) {
      logger.error('Failed to fetch notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      if (pollIntervalMs > 0) {
        const interval = setInterval(fetchNotifications, pollIntervalMs);
        return () => clearInterval(interval);
      }
    }
  }, [userId, pollIntervalMs]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification): Promise<void> => {
    try {
      if (!userId) return;
      if (!notification) return;

      if (!notification.is_read) {
        await markAsRead(userId);
        await fetchNotifications();
      }
      handleClose();
      if (notification?.link) {
        navigate(notification.link);
      }
    } catch (error: unknown) {
      logger.error('Failed to handle notification click:', error);
      // Don't prevent navigation if marking as read fails
      handleClose();
      if (notification?.link) {
        navigate(notification.link);
      }
    }
  };

  const handleDeleteNotification = async (id: number, event: React.MouseEvent): Promise<void> => {
    event.stopPropagation();
    try {
      if (!id) return;
      await deleteNotification(id);
      await fetchNotifications();
    } catch (error: unknown) {
      logger.error('Failed to delete notification:', error);
      // Continue - user can try again
    }
  };

  const handleMarkAllAsRead = async (): Promise<void> => {
    if (!userId) return;
    try {
      await markAsRead(userId);
      await fetchNotifications();
    } catch (error: unknown) {
      logger.error('Failed to mark all notifications as read:', error);
    }
  };

  return {
    anchorEl,
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    handleClick,
    handleClose,
    handleNotificationClick,
    handleDeleteNotification,
    handleMarkAllAsRead
  };
};
