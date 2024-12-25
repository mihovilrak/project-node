import React from 'react';
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
import { NotificationCenterProps } from '../../types/notification';
import { useNotificationCenter } from '../../hooks/notification/useNotificationCenter';

const iconMap: { [key: string]: React.ComponentType } = {
  task: TaskIcon,
  project: FolderIcon,
  comment: CommentIcon,
  deadline: AlarmIcon,
  mention: NotificationsIcon,
  system: InfoIcon
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, className }) => {
  const {
    anchorEl,
    notifications,
    loading,
    unreadCount,
    handleClick,
    handleClose,
    handleNotificationClick,
    handleDeleteNotification
  } = useNotificationCenter(userId);

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
          sx: { width: 360, maxHeight: 480 }
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
                  backgroundColor: notification.is_read ? 'inherit' : 'action.hover'
                }}
              >
                <ListItemIcon>
                  {getIcon(notification.type_name || '')}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={notification.message}
                />
                <IconButton
                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                  size="small"
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
