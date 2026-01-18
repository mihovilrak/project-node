import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TimeLogStatsProps } from '../../types/timeLog';

const TimeLogStats: React.FC<TimeLogStatsProps> = ({ timeLogs }) => {
  console.log('Time Logs in Stats:', timeLogs);

  const totalHours = timeLogs.reduce((sum, log) => {
    console.log('Processing log in Stats:', log);
    let hours = typeof log.spent_time === 'string'
      ? parseFloat(log.spent_time)
      : (typeof log.spent_time === 'number' ? log.spent_time : 0);
    if (isNaN(hours) || hours === null || hours === undefined) hours = 0;
    console.log('Hours from log:', hours);
    return sum + hours;
  }, 0);

  console.log('Total hours:', totalHours);
  const wholeHours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - wholeHours) * 60);
  const formatted = `${wholeHours}h ${minutes}m`;
  console.log('Formatted total time:', formatted);

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
