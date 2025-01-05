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
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" color="textSecondary">
          No watchers.
        </Typography>
        {canManageWatchers && (
          <Box sx={{ mt: 2 }}>
            <PermissionButton
              onClick={onManageWatchers}
              requiredPermission="Edit tasks"
              variant="outlined"
              size="medium"
              sx={{ px: 3, py: 1 }}
            >
              Add Watchers
            </PermissionButton>
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        px: 2 
      }}>
        <Typography variant="h5" component="h2">
          Watchers:
        </Typography>
        {canManageWatchers && (
          <PermissionButton
            onClick={onManageWatchers}
            requiredPermission="Edit tasks"
            variant="contained"
            size="medium"
            sx={{ px: 3, py: 1 }}
          >
            Manage Watchers
          </PermissionButton>
        )}
      </Box>
      <List sx={{ py: 1 }}>
        {watchers.map((watcher) => (
          <ListItem key={watcher.user_id} sx={{ py: 1 }}>
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
