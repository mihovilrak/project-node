import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { TimeLog, TimeLogCreate } from '../../types/timeLog';
import { getTaskTimeLogs } from '../../api/timeLogs';
import TimeLogDialog from '../TimeLog/TimeLogDialog';
import TimeLogStats from '../TimeLog/TimeLogStats';
import TimeLogList from '../TimeLog/TimeLogList';
import { TaskTimeLogsProps } from '../../types/task';
import { useTimeLogCrud } from '../../hooks/timeLog/useTimeLogCrud';

const TaskTimeLogs: React.FC<TaskTimeLogsProps> = ({ task }) => {
  const { id } = useParams<{ id: string }>();
  const taskId = id ? Number(id) : undefined;
  const { timeLogs, loading, error, saveTimeLog, deleteTimeLog } =
    useTimeLogCrud(
      (signal) => getTaskTimeLogs(Number(id), signal),
      [id],
      Boolean(id),
    );
  const [actionError, setActionError] = useState<string | null>(null);
  const [timeLogDialogOpen, setTimeLogDialogOpen] = useState<boolean>(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);

  const handleTimeLogEdit = (timeLog: TimeLog): void => {
    setSelectedTimeLog(timeLog);
    setTimeLogDialogOpen(true);
  };

  const handleTimeLogDelete = async (timeLogId: number): Promise<void> => {
    if (!timeLogId) return;
    setActionError(null);
    try {
      await deleteTimeLog(timeLogId);
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to delete time log',
      );
    }
  };

  // Errors propagate so TimeLogDialog can show them and stay open.
  const handleTimeLogSubmit = async (
    timeLogData: TimeLogCreate,
  ): Promise<void> => {
    await saveTimeLog(timeLogData, selectedTimeLog?.id);
  };

  const handleDialogClose = (): void => {
    setTimeLogDialogOpen(false);
    setSelectedTimeLog(null);
  };

  if (!id) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Task ID is required
      </Alert>
    );
  }

  // Keep the list mounted while refetching after a mutation.
  if (loading && !timeLogs.length) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Time Logs</Typography>
          <Button
            variant="contained"
            onClick={() => setTimeLogDialogOpen(true)}
          >
            Log Time
          </Button>
        </Box>

        {actionError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setActionError(null)}
          >
            {actionError}
          </Alert>
        )}

        <TimeLogStats timeLogs={timeLogs} />
        <TimeLogList
          timeLogs={timeLogs}
          onEdit={handleTimeLogEdit}
          onDelete={handleTimeLogDelete}
        />

        <TimeLogDialog
          open={timeLogDialogOpen}
          onClose={handleDialogClose}
          taskId={taskId}
          projectId={task?.project_id || undefined}
          timeLog={selectedTimeLog}
          onSubmit={handleTimeLogSubmit}
        />
      </Paper>
    </Box>
  );
};

export default TaskTimeLogs;
