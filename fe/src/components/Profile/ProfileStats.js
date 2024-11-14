import React from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Assignment as TaskIcon,
  AccessTime as TimeIcon,
  CheckCircle as CompletedIcon,
  Timeline as ProjectIcon
} from '@mui/icons-material';

const StatCard = ({ icon: Icon, title, value, loading }) => (
  <Paper sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Icon color="primary" />
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <Typography variant="h6">
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  </Paper>
);

const ProfileStats = ({ stats, loading }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          icon={TaskIcon}
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          icon={CompletedIcon}
          title="Completed Tasks"
          value={stats?.completedTasks || 0}
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          icon={ProjectIcon}
          title="Active Projects"
          value={stats?.activeProjects || 0}
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          icon={TimeIcon}
          title="Hours Logged"
          value={`${stats?.totalHours || 0}h`}
          loading={loading}
        />
      </Grid>
    </Grid>
  );
};

export default ProfileStats; 