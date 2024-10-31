import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProfileTaskList = ({ tasks }) => {
  const navigate = useNavigate();

  if (!tasks.length) {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        No recent tasks
      </Typography>
    );
  }

  return (
    <List>
      {tasks.map((task) => (
        <ListItem
          key={task.id}
          button
          onClick={() => navigate(`/tasks/${task.id}`)}
          sx={{ 
            mb: 1, 
            border: 1, 
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <ListItemText
            primary={task.name}
            secondary={
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip 
                  label={task.priority} 
                  size="small"
                  color={task.priority_color}
                />
                <Chip 
                  label={task.status} 
                  size="small"
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ProfileTaskList; 