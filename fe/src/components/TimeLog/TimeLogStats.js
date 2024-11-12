import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon 
} from '@mui/icons-material';

const TimeLogStats = ({ timeLogs }) => {
  const calculateStats = () => {
    const today = new Date();
    const thisWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return timeLogs.reduce((stats, log) => {
      const logDate = new Date(log.start_time);
      const duration = (new Date(log.end_time) - new Date(log.start_time)) / (1000 * 60 * 60);

      // Total hours
      stats.totalHours += duration;

      // This week's hours
      if (logDate >= thisWeekStart) {
        stats.weeklyHours += duration;
      }

      // This month's hours
      if (logDate >= thisMonthStart) {
        stats.monthlyHours += duration;
      }

      // Activity type stats
      if (!stats.activityTypes[log.activity_type]) {
        stats.activityTypes[log.activity_type] = 0;
      }
      stats.activityTypes[log.activity_type] += duration;

      return stats;
    }, {
      totalHours: 0,
      weeklyHours: 0,
      monthlyHours: 0,
      activityTypes: {}
    });
  };

  const stats = calculateStats();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Time Tracking Statistics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="subtitle1">This Week</Typography>
              </Box>
              <Typography variant="h4">
                {stats.weeklyHours.toFixed(1)}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="subtitle1">This Month</Typography>
              </Box>
              <Typography variant="h4">
                {stats.monthlyHours.toFixed(1)}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="subtitle1">Total Hours</Typography>
              </Box>
              <Typography variant="h4">
                {stats.totalHours.toFixed(1)}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" gutterBottom>
        Activity Breakdown
      </Typography>
      {Object.entries(stats.activityTypes).map(([type, hours]) => (
        <Box key={type} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">{type}</Typography>
            <Typography variant="body2">{hours.toFixed(1)}h</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(hours / stats.totalHours) * 100} 
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
      ))}
    </Paper>
  );
};

export default TimeLogStats; 