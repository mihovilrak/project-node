import React from 'react';
import { Paper, Stack, Typography } from '@mui/material';
import { CalendarViewProps } from '../../types/calendar';
import { useCalendarWeek } from '../../hooks/calendar/useCalendarWeek';
import { formatHoursDuration } from '../../utils/timeUtils';
import { formatDate } from '../../utils/dateUtils';
import { getTaskDayLabel, sumHours } from '../../utils/calendarUtils';
import CalendarTaskChip from './CalendarTaskChip';

const CalendarWeekView: React.FC<CalendarViewProps> = ({
  date,
  tasks,
  timeLogs,
  onDateChange,
  onViewChange,
  onTaskClick,
  onTimeLogClick,
}) => {
  const { getWeekDays, getTasksForDay, getTimeLogsForDay } = useCalendarWeek(
    date,
    tasks,
    timeLogs,
  );
  const days = getWeekDays();

  return (
    <Stack spacing={2} data-testid="week-grid">
      {days.map((day) => {
        const dayLogs = getTimeLogsForDay(day);
        return (
          <Paper
            key={day.toDateString()}
            role="presentation"
            sx={{
              p: 2,
              backgroundColor:
                day.toDateString() === new Date().toDateString()
                  ? 'action.hover'
                  : 'background.paper',
            }}
          >
            <Typography
              variant="subtitle1"
              component="button"
              sx={{
                mb: 2,
                fontWeight: 'medium',
                cursor: 'pointer',
                background: 'none',
                border: 0,
                p: 0,
                color: 'inherit',
                textAlign: 'left',
              }}
              onClick={() => {
                onDateChange(day);
                onViewChange('day');
              }}
            >
              {day.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
              {dayLogs.length > 0
                ? ` - ${formatHoursDuration(sumHours(dayLogs))} logged`
                : ''}
            </Typography>
            {getTasksForDay(day).map((task) => (
              <CalendarTaskChip
                key={task.id}
                task={task}
                onClick={onTaskClick}
                prefix={getTaskDayLabel(task, day)}
                footer={
                  task.due_date
                    ? `Due ${formatDate(task.due_date)}`
                    : 'No due date'
                }
              />
            ))}
            {dayLogs.map((timeLog) => (
              <Paper
                key={timeLog.id}
                role="button"
                tabIndex={0}
                sx={{
                  p: 1,
                  mb: 1,
                  cursor: 'pointer',
                  backgroundColor:
                    timeLog.activity_type_color || 'background.paper',
                  '&:hover': { opacity: 0.9 },
                }}
                onClick={() => onTimeLogClick(timeLog.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onTimeLogClick(timeLog.id);
                  }
                }}
              >
                <Typography variant="subtitle2">
                  {timeLog.task_name || 'Unknown Task'} -{' '}
                  {formatHoursDuration(timeLog.spent_time)}
                </Typography>
              </Paper>
            ))}
          </Paper>
        );
      })}
    </Stack>
  );
};

export default CalendarWeekView;
