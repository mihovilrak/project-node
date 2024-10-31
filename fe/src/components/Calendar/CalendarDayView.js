import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CalendarDayView = ({ date, tasks }) => {
  const navigate = useNavigate();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getTasksForHour = (hour) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.start_date);
      return taskDate.getHours() === hour;
    });
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
      {hours.map(hour => (
        <Paper 
          key={hour}
          variant="outlined"
          sx={{ 
            p: 2, 
            mb: 1, 
            display: 'flex',
            minHeight: 80,
            backgroundColor: hour % 2 === 0 ? 'background.default' : 'background.paper'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              width: 100,
              color: 'text.secondary',
              borderRight: 1,
              borderColor: 'divider',
              pr: 2,
              mr: 2
            }}
          >
            {`${hour.toString().padStart(2, '0')}:00`}
          </Typography>
          
          <Box sx={{ flex: 1 }}>
            {getTasksForHour(hour).map(task => (
              <Paper
                key={task.id}
                sx={{ 
                  p: 1, 
                  mb: 1, 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <Typography variant="subtitle2">{task.name}</Typography>
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
                </Box>
              </Paper>
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default CalendarDayView; 