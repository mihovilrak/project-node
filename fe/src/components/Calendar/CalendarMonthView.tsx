import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip
} from '@mui/material';
import { Task } from '../../types/task';
import { TimeLog } from '../../types/timeLog';
import {
  CalendarViewProps,
  CalendarDay
} from '../../types/calendar';
import { getPriorityColor } from '../../utils/taskUtils';

const CalendarMonthView: React.FC<CalendarViewProps> = ({ 
  view,
  date,
  tasks,
  timeLogs,
  onDateChange,
  onViewChange,
  onTaskClick,
  onTimeLogClick 
}) => {
  const getDaysInMonth = (): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];

    // Add days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: prevDate.getDay() === 0 || prevDate.getDay() === 6,
        tasks: getTasksForDay(prevDate),
        timeLogs: getTimeLogsForDay(prevDate),
        totalTime: calculateTotalTime(getTimeLogsForDay(prevDate))
      });
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
        tasks: getTasksForDay(currentDate),
        timeLogs: getTimeLogsForDay(currentDate),
        totalTime: calculateTotalTime(getTimeLogsForDay(currentDate))
      });
    }

    // Add days from next month
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6,
        tasks: getTasksForDay(nextDate),
        timeLogs: getTimeLogsForDay(nextDate),
        totalTime: calculateTotalTime(getTimeLogsForDay(nextDate))
      });
    }

    return days;
  };

  const getTasksForDay = (day: Date): Task[] => {
    return tasks.filter(task => {
      const taskDate = new Date(task.start_date);
      return taskDate.toDateString() === day.toDateString();
    });
  };

  const getTimeLogsForDay = (day: Date): TimeLog[] => {
    return timeLogs.filter(timeLog => {
      const logDate = new Date(timeLog.created_on);
      return logDate.toDateString() === day.toDateString();
    });
  };

  const calculateTotalTime = (dayTimeLogs: TimeLog[]): number => {
    return dayTimeLogs.reduce((total, log) => total + (log.spent_time || 0), 0);
  };

  return (
    <Grid container spacing={1}>
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
              {day.tasks.slice(0, 3).map((task) => (
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
