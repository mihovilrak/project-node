import React from 'react';
import { Paper } from '@mui/material';
import TimeLogDialog from '../TimeLog/TimeLogDialog';
import TimeLogList from '../TimeLog/TimeLogList';
import TimeLogStats from '../TimeLog/TimeLogStats';
import { TaskTimeLoggingProps } from '../../types/timeLog';

const TaskTimeLogging: React.FC<TaskTimeLoggingProps> = ({
  taskId,
  projectId,
  timeLogs,
  timeLogDialogOpen,
  selectedTimeLog,
  onTimeLogSubmit,
  onTimeLogDelete,
  onTimeLogEdit,
  onTimeLogDialogClose
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <TimeLogStats timeLogs={timeLogs} />
      <TimeLogList
        timeLogs={timeLogs}
        onEdit={onTimeLogEdit}
        onDelete={onTimeLogDelete}
      />
      <TimeLogDialog
        open={timeLogDialogOpen}
        onClose={onTimeLogDialogClose}
        onSubmit={onTimeLogSubmit}
        timeLog={selectedTimeLog}
        taskId={taskId}
        projectId={projectId}
      />
    </Paper>
  );
};

export default TaskTimeLogging;
