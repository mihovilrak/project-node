import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getNotifications, 
  markAsRead,
  deleteNotification 
} from '../../api/notifications';
import { Notification } from '../../types/notification';

export const useNotificationCenter = (userId: number | undefined) => {
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
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification): Promise<void> => {
    try {
      if (!userId) return;
      
      if (!notification.is_read) {
        await markAsRead(userId);
        await fetchNotifications();
      }
      handleClose();
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  const handleDeleteNotification = async (id: number, event: React.MouseEvent): Promise<void> => {
    event.stopPropagation();
    try {
      await deleteNotification(id);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return {
    anchorEl,
    notifications,
    loading,
    unreadCount,
    handleClick,
    handleClose,
    handleNotificationClick,
    handleDeleteNotification
  };
};
