import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { TimeLog, ActivityType } from '../../types/timeLog';

interface TimeLogSummaryProps {
  timeLogs: TimeLog[];
  activityTypes: ActivityType[];
}

const TimeLogSummary: React.FC<TimeLogSummaryProps> = ({ timeLogs, activityTypes }) => {
  const totalTime = timeLogs.reduce((sum, log) => sum + log.spent_time, 0);
  
  const timeByActivity = timeLogs.reduce((acc, log) => {
    acc[log.activity_type_id] = (acc[log.activity_type_id] || 0) + log.spent_time;
    return acc;
  }, {} as Record<number, number>);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Time Summary
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          Total Time: {formatTime(totalTime)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {activityTypes.map(type => {
          const time = timeByActivity[type.id] || 0;
          if (time === 0) return null;
          return (
            <Chip
              key={type.id}
              label={`${type.name}: ${formatTime(time)}`}
              sx={{ backgroundColor: type.color, color: '#fff' }}
            />
          );
        })}
      </Box>
    </Paper>
  );
};

export default TimeLogSummary; 