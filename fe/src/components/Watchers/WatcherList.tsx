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
  Box,
  Button
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { WatcherListProps } from '../../types/watcher';
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
              requiredPermission="Edit tasks"
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Watchers
        </Typography>
        {canManageWatchers && (
          <PermissionButton
            onClick={onManageWatchers}
            requiredPermission="Edit tasks"
            variant="contained"
            size="small"
          >
            Manage Watchers
          </PermissionButton>
        )}
      </Box>
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
    </Paper>
  );
};

export default WatcherList;
