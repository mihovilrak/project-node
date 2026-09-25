import React, { useState } from 'react';
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
  Typography,
  Alert,
} from '@mui/material';
import { WatcherDialogProps } from '../../types/watcher';
import { ProjectMember } from '../../types/project';
import { getProjectMembers } from '../../api/projects';
import { useAsyncResource } from '../../hooks/common/useAsyncResource';

const EMPTY_MEMBERS: ProjectMember[] = [];

const WatcherDialog: React.FC<WatcherDialogProps> = ({
  open,
  onClose,
  projectId,
  currentWatchers,
  onAddWatcher,
  onRemoveWatcher,
}) => {
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const {
    data: projectMembers,
    loading,
    error,
  } = useAsyncResource<ProjectMember[]>(
    async (signal) => (await getProjectMembers(projectId, signal)) || [],
    [projectId],
    {
      initialData: EMPTY_MEMBERS,
      enabled: open && !!projectId,
      errorMessage: 'Failed to load project members',
    },
  );

  // One request per member at a time, so a double click cannot add twice.
  const handleToggle = async (userId: number) => {
    if (!userId || pendingIds.has(userId)) return;
    const isCurrentWatcher = (currentWatchers || []).some(
      (w) => w?.user_id === userId,
    );
    setPendingIds((prev) => new Set(prev).add(userId));
    try {
      await (isCurrentWatcher ? onRemoveWatcher(userId) : onAddWatcher(userId));
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { minHeight: '50vh' },
        },
      }}
      aria-labelledby="watcher-dialog-title"
    >
      <DialogTitle id="watcher-dialog-title">Manage Watchers</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : projectMembers.length === 0 ? (
          !error && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                No project members available
              </Typography>
            </Box>
          )
        ) : (
          <List>
            {projectMembers.map((member) => {
              if (!member?.user_id) return null;
              const isWatcher = (currentWatchers || []).some(
                (w) => w?.user_id === member.user_id,
              );
              const name =
                `${member?.name || ''} ${member?.surname || ''}`.trim() ||
                'Unknown User';
              return (
                <ListItem
                  component="div"
                  key={member.user_id}
                  onClick={() => handleToggle(member.user_id)}
                  sx={{ '&:hover': { cursor: 'pointer' } }}
                >
                  <ListItemText
                    primary={name}
                    secondary={member?.role || 'No role'}
                  />
                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="end"
                      checked={isWatcher}
                      disabled={pendingIds.has(member.user_id)}
                      onChange={() => handleToggle(member.user_id)}
                      slotProps={{ input: { 'aria-label': `Watch: ${name}` } }}
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
