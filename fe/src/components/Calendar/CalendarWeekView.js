import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CalendarWeekView = ({ date, tasks }) => {
  const navigate = useNavigate();
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(date);
    day.setDate(day.getDate() - day.getDay() + i);
    return day;
  });

  const getTasksForDay = (day) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.start_date);
      return taskDate.toDateString() === day.toDateString();
    });
  };

  return (
    <Grid container spacing={2}>
      {days.map(day => (
        <Grid item xs={12} key={day.toISOString()}>
          <Paper 
            variant="outlined"
            sx={{ p: 2 }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 2,
                color: day.toDateString() === new Date().toDateString() 
                  ? 'primary.main' 
                  : 'text.primary'
              }}
            >
              {day.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </Typography>

            {getTasksForDay(day).map(task => (
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
                <Typography variant="subtitle2">
                  {new Date(task.start_date).toLocaleTimeString('en-US', { 
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {task.name}
                </Typography>
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
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default CalendarWeekView; 