import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
  TimeLog,
  ActivityType,
  TimeLogDashboardProps,
} from '../../types/timeLog';
import TimeLogDialog from './TimeLogDialog';
import TimeLogTable from './TimeLogTable';
import TimeLogChart from './TimeLogChart';
import TimeLogSummary from './TimeLogSummary';
import {
  deleteTimeLog,
  getTaskTimeLogs,
} from '../../api/timeLogService';
import { useAuth } from '../../context/AuthContext';

const TimeLogDashboard: React.FC<TimeLogDashboardProps> = ({ taskId }) => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadData();
  }, [taskId]);

  const loadData = async () => {
    try {
      const logsData = await getTaskTimeLogs(taskId);
      setTimeLogs(logsData);
    } catch (error) {
      console.error('Error loading time log data:', error);
    }
  };

  const handleAddClick = () => {
    setSelectedTimeLog(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (timeLog: TimeLog) => {
    setSelectedTimeLog(timeLog);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    try {
      await deleteTimeLog(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting time log:', error);
    }
  };

  const handleDialogClose = (refreshData?: boolean) => {
    setIsDialogOpen(false);
    setSelectedTimeLog(null);
    if (refreshData) {
      loadData();
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Time Logs</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Time Log
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TimeLogSummary timeLogs={timeLogs} activityTypes={activityTypes} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TimeLogChart timeLogs={timeLogs} activityTypes={activityTypes} />
        </Grid>
        <Grid item xs={12}>
          <TimeLogTable
            timeLogs={timeLogs}
            activityTypes={activityTypes}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            currentUserId={currentUser?.id || 0}
          />
        </Grid>
      </Grid>

      <TimeLogDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        timeLog={selectedTimeLog}
        taskId={taskId}
      />
    </Box>
  );
};

export default TimeLogDashboard; 