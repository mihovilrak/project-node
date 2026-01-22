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
import dayjs from 'dayjs'; // Import dayjs library

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

  const formatTime = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <Grid container spacing={2} data-testid="week-grid">
      {days.map((day, index) => (
        <Grid size={{ xs: 12 }} key={index}>
          <Paper
            role="presentation"
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
                data-testid={`task-chip-${task.id}`}
              >
                <Typography variant="subtitle2">
                  {task.start_date ? dayjs(task.start_date).format('HH:mm') : 'No time'} - {task.name}
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
                <Typography variant="body2" color="text.secondary">
                  {task.due_date ? dayjs(task.due_date).format('HH:mm') : 'No due date'}
                </Typography>
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
                  })} - {timeLog.task_name} ({formatTime(timeLog.spent_time)} hours)
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
