import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Task } from '../../types/task';
import { CalendarViewProps } from '../../types/calendar';
import { useCalendarDays } from '../../hooks/calendar/useCalendarDays';
import { WEEKDAY_LABELS } from '../../utils/calendarUtils';
import { formatHoursDuration } from '../../utils/timeUtils';
import CalendarTaskChip from './CalendarTaskChip';

const CalendarMonthView: React.FC<CalendarViewProps> = ({
  date,
  tasks,
  timeLogs,
  onDateChange,
  onViewChange,
  onTaskClick,
}) => {
  const { getDaysInMonth } = useCalendarDays(date, tasks, timeLogs);

  return (
    <Box
      data-testid="month-grid"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: 1,
      }}
    >
      {WEEKDAY_LABELS.map((label) => (
        <Typography
          key={label}
          variant="subtitle2"
          align="center"
          data-testid="weekday-header"
        >
          {label}
        </Typography>
      ))}
      {getDaysInMonth().map((day) => (
        <Paper
          key={day.date.toDateString()}
          data-testid="month-day"
          role="button"
          tabIndex={0}
          aria-label={day.date.toDateString()}
          sx={{
            p: 1,
            minHeight: 120,
            minWidth: 0,
            backgroundColor: day.isToday
              ? 'action.hover'
              : day.isCurrentMonth
                ? 'background.paper'
                : 'action.disabledBackground',
            cursor: 'pointer',
            '&:hover': { opacity: 0.9 },
          }}
          onClick={() => {
            onDateChange(day.date);
            onViewChange('day');
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onDateChange(day.date);
              onViewChange('day');
            }
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
              <CalendarTaskChip
                key={task.id}
                task={task}
                onClick={onTaskClick}
                compact
              />
            ))}
            {day.tasks.length > 3 ? (
              <Typography variant="caption" color="text.secondary">
                +{day.tasks.length - 3} more
              </Typography>
            ) : null}
            {day.totalTime > 0 ? (
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                Time logged: {formatHoursDuration(day.totalTime)}
              </Typography>
            ) : null}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default CalendarMonthView;
