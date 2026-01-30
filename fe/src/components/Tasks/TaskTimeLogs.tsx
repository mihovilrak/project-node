import React, { useState, useEffect } from 'react';
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
import {
  getTaskTimeLogs,
  deleteTimeLog
} from '../../api/timeLogs';
import TimeLogDialog from '../TimeLog/TimeLogDialog';
import TimeLogStats from '../TimeLog/TimeLogStats';
import TimeLogList from '../TimeLog/TimeLogList';
import { TaskTimeLogsProps } from '../../types/task';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const TaskTimeLogs: React.FC<TaskTimeLogsProps> = ({ task }) => {
  const { id } = useParams<{ id: string }>();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLogDialogOpen, setTimeLogDialogOpen] = useState<boolean>(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);

  useEffect(() => {
    if (id) {
      fetchTimeLogs();
    }
  }, [id]);

  const fetchTimeLogs = async (): Promise<void> => {
    if (!id) {
      setError('Task ID is required');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const logs = await getTaskTimeLogs(parseInt(id));
      setTimeLogs(logs || []);
    } catch (error: unknown) {
      logger.error('Failed to fetch time logs:', error);
      setError(getApiErrorMessage(error, 'Failed to load time logs'));
      setTimeLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeLogCreated = (): void => {
    fetchTimeLogs();
  };

  const handleTimeLogEdit = (timeLog: TimeLog): void => {
    setSelectedTimeLog(timeLog);
    setTimeLogDialogOpen(true);
  };

  const handleTimeLogDelete = async (timeLogId: number): Promise<void> => {
    if (!timeLogId) return;
    try {
      await deleteTimeLog(timeLogId);
      fetchTimeLogs();
    } catch (error: unknown) {
      logger.error('Failed to delete time log:', error);
      setError(getApiErrorMessage(error, 'Failed to delete time log'));
    }
  };

  const handleTimeLogSubmit = async (timeLogData: TimeLogCreate): Promise<void> => {
    try {
      // Handle time log submission logic here
      await fetchTimeLogs(); // Refresh the list after submission
      setTimeLogDialogOpen(false);
      setSelectedTimeLog(null);
    } catch (error) {
      logger.error('Failed to submit time log:', error);
    }
  };

  if (loading) {
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
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6">Time Logs</Typography>
          <Button
            variant="contained"
            onClick={() => setTimeLogDialogOpen(true)}
          >
            Log Time
          </Button>
        </Box>

        <TimeLogStats timeLogs={timeLogs} />
        <TimeLogList
          timeLogs={timeLogs}
          onEdit={handleTimeLogEdit}
          onDelete={handleTimeLogDelete}
        />

        <TimeLogDialog
          open={timeLogDialogOpen}
          onClose={() => {
            setTimeLogDialogOpen(false);
            setSelectedTimeLog(null);
          }}
          taskId={id ? parseInt(id) : undefined}
          projectId={task?.project_id || undefined}
          timeLog={selectedTimeLog}
          onSubmit={handleTimeLogSubmit}
        />
      </Paper>
    </Box>
  );
};

export default TaskTimeLogs;
