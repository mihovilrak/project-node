import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Task as TaskIcon,
  Folder as FolderIcon,
  Comment as CommentIcon,
  Alarm as AlarmIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  getNotifications, 
  markAsRead,
  deleteNotification 
} from '../../api/notifications';
import {
  Notification,
  NotificationCenterProps
} from '../../types/notification';
import { useAuth } from '../../context/AuthContext';

const iconMap: { [key: string]: React.ComponentType } = {
  task: TaskIcon,
  project: FolderIcon,
  comment: CommentIcon,
  deadline: AlarmIcon,
  mention: NotificationsIcon,
  system: InfoIcon
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const fetchNotifications = async (): Promise<void> => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      const data = await getNotifications(currentUser.id);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchNotifications();
      // Set up polling for new notifications
      const interval = setInterval(fetchNotifications, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification): Promise<void> => {
    try {
      if (!currentUser?.id) return;
      
      if (!notification.is_read) {
        await markAsRead(currentUser.id);
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

  const getIcon = (type: string): JSX.Element => {
    const Icon = iconMap[type] || NotificationsIcon;
    return <Icon />;
  };

  return (
    <>
      <IconButton
        className={className}
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { 
            width: 360,
            maxHeight: 480
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.is_read ? 'inherit' : 'action.hover',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', flexGrow: 1 }}>
                  <ListItemIcon>
                    {getIcon(notification.type_name || '')}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.created_on), { addSuffix: true })}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
                <IconButton
                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter; 