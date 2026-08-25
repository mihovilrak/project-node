import React, { useState, useMemo } from 'react';
import {
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Task as TaskIcon,
  Folder as FolderIcon,
  Comment as CommentIcon,
  Alarm as AlarmIcon,
  Info as InfoIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotificationCenter } from '../../hooks/notification/useNotificationCenter';

const iconMap: { [key: string]: React.ComponentType } = {
  task: TaskIcon,
  project: FolderIcon,
  comment: CommentIcon,
  deadline: AlarmIcon,
  mention: NotificationsIcon,
  system: InfoIcon
};

type TabValue = 'all' | 'read' | 'unread';

const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const [tabValue, setTabValue] = useState<TabValue>('all');
  const [markingAll, setMarkingAll] = useState(false);

  const {
    notifications,
    loading,
    unreadCount,
    handleNotificationClick,
    handleDeleteNotification,
    handleMarkAllAsRead,
    fetchNotifications
  } = useNotificationCenter(userId, 60000);

  const filteredNotifications = useMemo(() => {
    if (tabValue === 'read') return notifications.filter((n) => n?.is_read);
    if (tabValue === 'unread') return notifications.filter((n) => !n?.is_read);
    return notifications;
  }, [notifications, tabValue]);

  const getIcon = (type: string): React.ReactElement => {
    const Icon = iconMap[type] || NotificationsIcon;
    return <Icon />;
  };

  const onMarkAllAsRead = async (): Promise<void> => {
    setMarkingAll(true);
    try {
      await handleMarkAllAsRead();
      await fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  if (userId == null) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">Sign in to view notifications.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 720, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h5" component="h1">
          Notifications
        </Typography>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={markingAll ? <CircularProgress size={16} /> : <DoneAllIcon />}
            onClick={onMarkAllAsRead}
            disabled={markingAll}
            data-testid="mark-all-read"
          >
            Mark all as read
          </Button>
        )}
      </Box>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(_, v: TabValue) => setTabValue(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 48 }}
        >
          <Tab label="All" value="all" data-testid="tab-all" />
          <Tab label="Read" value="read" data-testid="tab-read" />
          <Tab label="Unread" value="unread" data-testid="tab-unread" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress data-testid="loading-spinner" aria-label="Loading notifications" />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification) => {
              const isRead = notification?.is_read;
              return (
                <ListItem
                  key={notification?.id}
                  onClick={() => notification && handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: isRead ? 'inherit' : 'action.hover',
                    '&:hover': { cursor: 'pointer' }
                  }}
                >
                  <ListItemIcon>{getIcon(notification?.type_name || '')}</ListItemIcon>
                  <ListItemText
                    primary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                          #{notification?.id}
                        </Typography>
                        {notification?.title || 'No title'}
                      </>
                    }
                    secondary={notification?.message || 'No message'}
                  />
                  <IconButton
                    onClick={(e) => notification?.id && handleDeleteNotification(notification.id, e)}
                    size="small"
                    aria-label="delete notification"
                    disabled={!notification?.id}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default NotificationsPage;
