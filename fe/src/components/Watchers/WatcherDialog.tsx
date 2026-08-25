import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { WatcherDialogProps } from '../../types/watcher';
import { ProjectMember } from '../../types/project';
import { getProjectMembers } from '../../api/projects';
import logger from '../../utils/logger';

const WatcherDialog: React.FC<WatcherDialogProps> = ({
  open,
  onClose,
  projectId,
  currentWatchers,
  onAddWatcher,
  onRemoveWatcher
}) => {
  const [loading, setLoading] = useState(true);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        const members = await getProjectMembers(projectId);
        setProjectMembers(members || []);
      } catch (error) {
        logger.error('Failed to fetch project members:', error);
        setProjectMembers([]);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchProjectMembers();
    }
  }, [projectId, open]);

  const handleToggle = (userId: number) => {
    if (!userId) return;
    const isCurrentWatcher = (currentWatchers || []).some(w => w?.user_id === userId);
    if (isCurrentWatcher) {
      onRemoveWatcher(userId);
    } else {
      onAddWatcher(userId);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '50vh' }
      }}
    >
      <DialogTitle>Manage Watchers</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : projectMembers.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              No project members available
            </Typography>
          </Box>
        ) : (
          <List>
            {projectMembers.map((member) => {
              if (!member?.user_id) return null;
              const isWatcher = (currentWatchers || []).some(w => w?.user_id === member.user_id);
              return (
                <ListItem
                  component="div"
                  key={member.user_id}
                  onClick={() => handleToggle(member.user_id)}
                  sx={{ '&:hover': { cursor: 'pointer' } }}
                >
                  <ListItemText
                    primary={`${member?.name || ''} ${member?.surname || ''}`.trim() || 'Unknown User'}
                    secondary={member?.role || 'No role'}
                  />
                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="end"
                      checked={isWatcher}
                      onChange={() => handleToggle(member.user_id)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WatcherDialog;
