import React from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  CircularProgress
} from '@mui/material';
import { Task } from '../../types/task';
import { ProfileTaskListProps } from '../../types/profile';

const ProfileTaskList: React.FC<ProfileTaskListProps> = ({ tasks, onTaskClick, loading }) => {

  const handleTaskClick = (task: Task) => {
    onTaskClick(task.id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress data-testid="loading-spinner" />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Recent Tasks
      </Typography>
      {tasks.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No recent tasks
        </Typography>
      ) : (
        <List>
          {tasks.map((task) => (
            <ListItem key={task?.id} divider onClick={() => task && handleTaskClick(task)}>
              <ListItemText
                primary={task?.name || 'Unnamed Task'}
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                      label={task?.project_name || 'No Project'}
                      size="small"
                      variant="outlined"
                      data-testid="project-chip"
                    />
                    <Chip
                      label={task?.status_name || 'Unknown'}
                      size="small"
                      color="primary"
                      variant="outlined"
                      data-testid="status-chip"
                    />
                    <Chip
                      label={task?.priority_name || 'Unknown'}
                      size="small"
                      sx={{ bgcolor: task?.priority_color || '#666', color: 'white' }}
                      data-testid="priority-chip"
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
};

export default ProfileTaskList;
