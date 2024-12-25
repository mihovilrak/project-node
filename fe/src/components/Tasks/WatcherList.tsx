import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Tooltip,
  Box
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { WatcherListProps } from '../../types/task';
import PermissionButton from '../common/PermissionButton';

const WatcherList: React.FC<WatcherListProps> = ({
  watchers,
  canManageWatchers,
  onRemoveWatcher,
  onManageWatchers
}) => {
  if (!watchers?.length) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          No watchers
        </Typography>
        {canManageWatchers && (
          <Box sx={{ mt: 1 }}>
            <PermissionButton
              onClick={onManageWatchers}
              requiredPermission="Edit task"
              variant="outlined"
              size="small"
            >
              Add Watchers
            </PermissionButton>
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <Paper sx={{ mb: 2 }}>
      <List dense>
        {watchers.map((watcher) => (
          <ListItem key={watcher.user_id}>
            <ListItemText 
              primary={watcher.user_name}
              secondary={watcher.role}
            />
            {canManageWatchers && (
              <ListItemSecondaryAction>
                <Tooltip title="Remove watcher">
                  <IconButton
                    edge="end"
                    onClick={() => onRemoveWatcher(watcher.user_id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        ))}
      </List>
      {canManageWatchers && (
        <Box sx={{ p: 1 }}>
          <PermissionButton
            onClick={onManageWatchers}
            requiredPermission="Edit task"
            variant="outlined"
            size="small"
            fullWidth
          >
            Manage Watchers
          </PermissionButton>
        </Box>
      )}
    </Paper>
  );
};

export default WatcherList;
