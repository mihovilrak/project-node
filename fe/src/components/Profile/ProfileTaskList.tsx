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
import { useNavigate } from 'react-router-dom';

interface ProfileTaskListProps {
  tasks: Task[];
  onTaskClick: (taskId: number) => void;
  loading?: boolean;
}

const ProfileTaskList: React.FC<ProfileTaskListProps> = ({ tasks, onTaskClick, loading }) => {
  const navigate = useNavigate();

  const handleTaskClick = (task: Task) => {
    onTaskClick(task.id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Recent Tasks
      </Typography>
      <List>
        {tasks.map((task) => (
          <ListItem key={task.id} divider>
            <ListItemText
              primary={task.name}
              secondary={
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={task.project_name}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={task.status_name}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={task.priority_name}
                    size="small"
                    sx={{ bgcolor: task.priority_color, color: 'white' }}
                  />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default ProfileTaskList;
