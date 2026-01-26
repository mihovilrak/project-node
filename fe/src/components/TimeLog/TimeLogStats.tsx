import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TimeLogStatsProps } from '../../types/timeLog';

const TimeLogStats: React.FC<TimeLogStatsProps> = ({ timeLogs }) => {
  const totalHours = (timeLogs || []).reduce((sum, log) => {
    if (!log) return sum;
    let hours = typeof log?.spent_time === 'string'
      ? parseFloat(log.spent_time)
      : (typeof log?.spent_time === 'number' ? log.spent_time : 0);
    if (isNaN(hours) || hours === null || hours === undefined) hours = 0;
    return sum + hours;
  }, 0);

  const wholeHours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - wholeHours) * 60);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1">Total Time Spent:</Typography>
        <Typography variant="h6">
          {wholeHours}h {minutes}m
        </Typography>
      </Box>
    </Paper>
  );
};

export default TimeLogStats;
