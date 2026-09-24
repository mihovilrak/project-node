import React from 'react';
import { Grid, Box } from '@mui/material';
import TaskFiles from './TaskFiles';
import WatcherList from '../Watchers/WatcherList';
import WatcherDialog from '../Watchers/WatcherDialog';
import { TaskDetailsSidebarProps } from '../../types/task';

const TaskDetailsSidebar: React.FC<TaskDetailsSidebarProps> = ({
  id,
  projectId,
  watchers,
  watcherDialogOpen,
  onAddWatcher,
  onRemoveWatcher,
  onWatcherDialogClose,
  onManageWatchers,
}) => (
  <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
    <Box sx={{ mb: 5, p: 3 }}>
      <TaskFiles taskId={Number(id)} />
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
