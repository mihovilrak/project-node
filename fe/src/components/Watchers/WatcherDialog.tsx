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
  Box
} from '@mui/material';
import { WatcherDialogProps } from '../../types/watcher';
import { ProjectMember } from '../../types/project';
import { getProjectMembers } from '../../api/projects';

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
        setProjectMembers(members);
      } catch (error) {
        console.error('Failed to fetch project members:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchProjectMembers();
    }
  }, [projectId, open]);

  const handleToggle = (userId: number) => {
    const isCurrentWatcher = currentWatchers.some(w => w.user_id === userId);
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
        ) : (
          <List>
            {projectMembers.map((member) => {
              const isWatcher = currentWatchers.some(w => w.user_id === member.user_id);
              return (
                <ListItem 
                  component="div"
                  key={member.user_id}
                  onClick={() => handleToggle(member.user_id)}
                  sx={{ '&:hover': { cursor: 'pointer' } }}
                >
                  <ListItemText 
                    primary={member.name}
                    secondary={member.role}
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
