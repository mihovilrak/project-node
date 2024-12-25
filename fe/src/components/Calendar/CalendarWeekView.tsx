import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import { CalendarViewProps } from '../../types/calendar';
import { getPriorityColor } from '../../utils/taskUtils';
import { useCalendarWeek } from '../../hooks/calendar/useCalendarWeek';

const CalendarWeekView: React.FC<CalendarViewProps> = ({ 
  date,
  tasks,
  timeLogs,
  onDateChange,
  onViewChange,
  onTaskClick,
  onTimeLogClick 
}) => {
  const navigate = useNavigate();
  const { getWeekDays, getTasksForDay, getTimeLogsForDay } = useCalendarWeek(date, tasks, timeLogs);
  const days = getWeekDays();

  return (
    <Grid container spacing={2}>
      {days.map((day, index) => (
        <Grid item xs={12} key={index}>
          <Paper 
            sx={{ 
              p: 2,
              backgroundColor: day.toDateString() === new Date().toDateString() 
                ? 'action.hover' 
                : 'background.paper'
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ mb: 2, fontWeight: 'medium' }}
              onClick={() => {
                onDateChange(day);
                onViewChange('day');
              }}
              style={{ cursor: 'pointer' }}
            >
              {day.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
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
                onClick={() => onTaskClick(task.id)}
              >
                <Typography variant="subtitle2">
                  {new Date(task.start_date).toLocaleTimeString('en-US', { 
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {task.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip 
                    label={task.priority_name} 
                    size="small"
                    color={getPriorityColor(task.priority_name)}
                  />
                  <Chip 
                    label={task.status_name} 
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Paper>
            ))}
            {getTimeLogsForDay(day).map(timeLog => (
              <Paper
                key={timeLog.id}
                sx={{
                  p: 1,
                  mb: 1,
                  cursor: 'pointer',
                  backgroundColor: timeLog.activity_type_color,
                  '&:hover': { opacity: 0.9 }
                }}
                onClick={() => onTimeLogClick(timeLog.id)}
              >
                <Typography variant="subtitle2">
                  {new Date(timeLog.created_on).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {timeLog.task_name} ({timeLog.spent_time} minutes)
                </Typography>
              </Paper>
            ))}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default CalendarWeekView;
