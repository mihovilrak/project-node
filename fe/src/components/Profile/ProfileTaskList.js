import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatDistance } from 'date-fns';

const ProfileTaskList = ({ tasks, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Tasks</Typography>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={60} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (!tasks?.length) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Tasks</Typography>
        <Typography color="text.secondary">No recent tasks found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Recent Tasks</Typography>
      <List>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            sx={{
              mb: 1,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
            onClick={() => navigate(`/tasks/${task.id}`)}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">{task.name}</Typography>
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
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Project: {task.project}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due {formatDistance(new Date(task.due_date), new Date(), { addSuffix: true })}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

ProfileTaskList.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    project: PropTypes.string.isRequired,
    holder: PropTypes.string,
    start_date: PropTypes.string,
    due_date: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    priority_color: PropTypes.string.isRequired,
    created_by: PropTypes.string.isRequired
  })),
  loading: PropTypes.bool
};

export default ProfileTaskList; 