import React from 'react';
import { Grid } from '@mui/material';
import WatcherList from '../Watchers/WatcherList';
import WatcherDialog from '../Watchers/WatcherDialog';
import TaskFileSection from './TaskFileSection';
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
    <WatcherList
      watchers={watchers}
      canManageWatchers={true}
      onRemoveWatcher={onRemoveWatcher}
      onManageWatchers={onManageWatchers}
    />
    <TaskFileSection
      taskId={Number(id)}
      files={files}
      onFileUploaded={onFileUploaded}
      onFileDeleted={onFileDeleted}
    />
    <WatcherDialog
      open={watcherDialogOpen}
      onClose={onWatcherDialogClose}
      onAddWatcher={onAddWatcher}
      projectId={projectId}
      currentWatchers={watchers}
      onRemoveWatcher={onRemoveWatcher}
    />
  </Grid>
);

export default TaskDetailsSidebar;
