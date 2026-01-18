import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip
} from '@mui/material';
import { Task } from '../../types/task';
import { CalendarViewProps } from '../../types/calendar';
import { getPriorityColor } from '../../utils/taskUtils';
import { useCalendarDays } from '../../hooks/calendar/useCalendarDays';

const CalendarMonthView: React.FC<CalendarViewProps> = ({
  date,
  tasks,
  timeLogs,
  onDateChange,
  onViewChange,
  onTaskClick
}) => {
  const { getDaysInMonth } = useCalendarDays(date, tasks, timeLogs);

  return (
    <Grid container spacing={1} data-testid="month-grid">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <Grid item xs key={day}>
          <Typography variant="subtitle2" align="center" sx={{ mb: 1 }}>
            {day}
          </Typography>
        </Grid>
      ))}
      {getDaysInMonth().map((day, index) => (
        <Grid item xs={12 / 7} key={index}>
          <Paper
            sx={{
              p: 1,
              height: '100%',
              minHeight: 120,
              backgroundColor: day.isToday
                ? 'action.hover'
                : day.isCurrentMonth
                ? 'background.paper'
                : 'action.disabledBackground',
              cursor: 'pointer',
              '&:hover': { opacity: 0.9 }
            }}
            onClick={() => {
              onDateChange(day.date);
              onViewChange('day');
            }}
          >
            <Typography
              variant="body2"
              color={day.isCurrentMonth ? 'text.primary' : 'text.secondary'}
              sx={{ mb: 1 }}
            >
              {day.date.getDate()}
            </Typography>
            <Box sx={{ overflow: 'hidden' }}>
              {day.tasks.slice(0, 3).map((task: Task) => (
                <Chip
                  key={task.id}
                  label={task.name}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task.id);
                  }}
                  sx={{
                    mb: 0.5,
                    width: '100%',
                    backgroundColor: getPriorityColor(task.priority_name)
                  }}
                  data-testid={`task-chip-${task.id}`}
                />
              ))}
              {day.tasks.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  +{day.tasks.length - 3} more
                </Typography>
              )}
              {day.totalTime > 0 && (
                <Typography variant="caption" display="block" color="text.secondary">
                  Time logged: {Math.round(day.totalTime / 60)}h {day.totalTime % 60}m
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default CalendarMonthView;
