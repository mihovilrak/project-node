import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TimeLog } from '../../types/timeLog';

interface TimeLogStatsProps {
  timeLogs: TimeLog[];
}

const TimeLogStats: React.FC<TimeLogStatsProps> = ({ timeLogs }) => {
  const totalTime = timeLogs.reduce((sum, log) => sum + log.spent_time, 0);
  const totalHours = Math.floor(totalTime / 60);
  const totalMinutes = totalTime % 60;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1">Total Time Spent:</Typography>
        <Typography variant="h6">
          {totalHours}h {totalMinutes}m
        </Typography>
      </Box>
    </Paper>
  );
};

export default TimeLogStats; 