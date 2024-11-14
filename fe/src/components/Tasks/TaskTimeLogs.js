import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import TimeLogList from '../TimeLog/TimeLogList';
import TimeLogDialog from '../TimeLog/TimeLogDialog';
import TimeLogStats from '../TimeLog/TimeLogStats';
import { getTaskTimeLogs, deleteTimeLog } from '../../api/timeLogs';

const TaskTimeLogs = () => {
  const { id } = useParams();
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLogDialogOpen, setTimeLogDialogOpen] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState(null);

  useEffect(() => {
    fetchTimeLogs();
  }, [id]);

  const fetchTimeLogs = async () => {
    try {
      setLoading(true);
      const logs = await getTaskTimeLogs(id);
      setTimeLogs(logs);
    } catch (error) {
      console.error('Failed to fetch time logs:', error);
      setError('Failed to load time logs');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeLogCreated = () => {
    fetchTimeLogs();
  };

  const handleTimeLogEdit = (timeLog) => {
    setSelectedTimeLog(timeLog);
    setTimeLogDialogOpen(true);
  };

  const handleTimeLogDelete = async (timeLogId) => {
    try {
      await deleteTimeLog(id, timeLogId);
      fetchTimeLogs();
    } catch (error) {
      console.error('Failed to delete time log:', error);
      setError('Failed to delete time log');
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
          taskId={id}
          timeLog={selectedTimeLog}
          onTimeLogCreated={handleTimeLogCreated}
        />
      </Paper>
    </Box>
  );
};

export default TaskTimeLogs; 