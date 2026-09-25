import React from 'react';
import {
  Box,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Notification } from '../../types/notification';

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

interface NotificationListItemProps {
  notification: Notification;
  icon: React.ReactElement;
  /**
   * Extra content shown before the title.
   */
  prefix?: React.ReactNode;
  onOpen: (notification: Notification) => void;
  onDelete: (id: number, event: React.MouseEvent) => void;
}

/**
 * One notification row: the body is a keyboard-operable button that opens the
 * notification, and delete is a separate button beside it.
 */
const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notification,
  icon,
  prefix,
  onOpen,
  onDelete,
}) => {
  const title = notification.title || 'No title';
  return (
    <ListItem
      disablePadding
      sx={{
        backgroundColor: notification.is_read ? 'inherit' : 'action.hover',
      }}
      secondaryAction={
        <IconButton
          edge="end"
          onClick={(e) => notification.id && onDelete(notification.id, e)}
          size="small"
          aria-label={`Delete notification: ${title}`}
          disabled={!notification.id}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      }
    >
      <ListItemButton onClick={() => onOpen(notification)}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText
          primary={
            <>
              {!notification.is_read && (
                <Box component="span" sx={visuallyHidden}>
                  Unread:{' '}
                </Box>
              )}
              {prefix}
              {title}
            </>
          }
          secondary={notification.message || 'No message'}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default NotificationListItem;
