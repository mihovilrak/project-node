import React from 'react';
import { Grid } from '@mui/material';
import TaskHeader from './TaskHeader';
import { TaskDetailsHeaderProps } from '../../types/task';

const TaskDetailsHeader: React.FC<TaskDetailsHeaderProps> = ({
  task,
  statuses,
  statusMenuAnchor,
  onStatusMenuClick,
  onStatusMenuClose,
  onStatusChange,
  onDelete
}) => (
  <Grid item xs={12}>
    <TaskHeader
      task={task}
      statuses={statuses}
      statusMenuAnchor={statusMenuAnchor}
      onStatusMenuClick={onStatusMenuClick}
      onStatusMenuClose={onStatusMenuClose}
      onStatusChange={onStatusChange}
      onDelete={onDelete}
      canEdit={true}
      canDelete={true}
    />
  </Grid>
);

export default TaskDetailsHeader;
