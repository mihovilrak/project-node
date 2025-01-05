import React from 'react';
import { Grid, Box } from '@mui/material';
import TaskFileSection from './TaskFileSection';
import WatcherList from '../Watchers/WatcherList';
import WatcherDialog from '../Watchers/WatcherDialog';
import { TaskDetailsSidebarProps } from '../../types/task';

const TaskDetailsSidebar: React.FC<TaskDetailsSidebarProps> = ({
  id,
  projectId,
  files,
  watchers,
  watcherDialogOpen,
  onFileUploaded,
  onFileDeleted,
  onAddWatcher,
  onRemoveWatcher,
  onWatcherDialogClose,
  onManageWatchers
}) => (
  <Grid item xs={12} md={4}>
    <Box sx={{ mb: 5, p: 3 }}>
      <TaskFileSection
        taskId={Number(id)}
        files={files}
        onFileUploaded={onFileUploaded}
        onFileDeleted={onFileDeleted}
      />
    </Box>

    <Box sx={{ p: 3 }}>
      <WatcherList
        watchers={watchers}
        canManageWatchers={true}
        onRemoveWatcher={onRemoveWatcher}
        onManageWatchers={onManageWatchers}
      />
      <WatcherDialog
        open={watcherDialogOpen}
        onClose={onWatcherDialogClose}
        onAddWatcher={onAddWatcher}
        projectId={projectId}
        currentWatchers={watchers}
        onRemoveWatcher={onRemoveWatcher}
      />
    </Box>
  </Grid>
);

export default TaskDetailsSidebar;
