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
  onDelete,
  onTimeLogClick,
  onAddSubtaskClick,
  canEdit,
  canDelete
}) => {
  if (!task) {
    return null;
  }

  return (
    <Grid size={{ xs: 12 }}>
      <TaskHeader
        task={task}
        statuses={statuses || []}
        statusMenuAnchor={statusMenuAnchor}
        onStatusMenuClick={onStatusMenuClick}
        onStatusMenuClose={onStatusMenuClose}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onTimeLogClick={onTimeLogClick}
        onAddSubtaskClick={onAddSubtaskClick}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </Grid>
  );
};

export default TaskDetailsHeader;
