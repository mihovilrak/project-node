import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CalendarMonthView = ({ date, tasks }) => {
  const navigate = useNavigate();
  
  const getDaysInMonth = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({ date: prevDate, isCurrentMonth: false });
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ 
        date: new Date(year, month, i), 
        isCurrentMonth: true 
      });
    }

    // Add days from next month
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ 
        date: new Date(year, month + 1, i), 
        isCurrentMonth: false 
      });
    }

    return days;
  };

  const getTasksForDay = (day) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.start_date);
      return taskDate.toDateString() === day.toDateString();
    });
  };

  const days = getDaysInMonth();

  return (
    <Grid container spacing={1}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <Grid item xs key={day}>
          <Typography 
            variant="subtitle2" 
            align="center"
            sx={{ mb: 1, color: 'text.secondary' }}
          >
            {day}
          </Typography>
        </Grid>
      ))}

      {days.map(({ date: day, isCurrentMonth }) => {
        const dayTasks = getTasksForDay(day);
        const isToday = day.toDateString() === new Date().toDateString();

        return (
          <Grid item xs key={day.toISOString()}>
            <Paper
              variant="outlined"
              sx={{
                p: 1,
                height: 120,
                overflow: 'hidden',
                opacity: isCurrentMonth ? 1 : 0.5,
                backgroundColor: isToday ? 'action.selected' : 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <Typography 
                variant="body2"
                sx={{ 
                  mb: 1,
                  color: isToday ? 'primary.main' : 'text.primary'
                }}
              >
                {day.getDate()}
              </Typography>

              <Box sx={{ overflow: 'hidden' }}>
                {dayTasks.slice(0, 3).map(task => (
                  <Chip
                    key={task.id}
                    label={task.name}
                    size="small"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    sx={{ 
                      mb: 0.5, 
                      width: '100%',
                      backgroundColor: task.priority_color
                    }}
                  />
                ))}
                {dayTasks.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{dayTasks.length - 3} more
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CalendarMonthView; 