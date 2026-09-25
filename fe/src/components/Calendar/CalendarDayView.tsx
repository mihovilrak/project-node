import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { CalendarViewProps } from '../../types/calendar';
import { useTasksByHour } from '../../hooks/calendar/useTasksByHour';
import { getTaskDayLabel } from '../../utils/calendarUtils';
import { formatHoursDuration } from '../../utils/timeUtils';
import CalendarTaskChip from './CalendarTaskChip';

const CalendarDayView: React.FC<CalendarViewProps> = ({
  date,
  tasks,
  timeLogs,
  onTaskClick,
  onTimeLogClick,
}) => {
  const { hours, allDayTasks, dayTimeLogs, totalHours, getTasksForHour } =
    useTasksByHour(tasks, timeLogs, date);

  return (
    <Box
      sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}
      data-testid="day-view"
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        {date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }} data-testid="all-day">
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 1, fontWeight: 'medium' }}
        >
          All day
        </Typography>
        {allDayTasks.length === 0 && dayTimeLogs.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Nothing scheduled
          </Typography>
        )}
        {allDayTasks.map((task) => (
          <CalendarTaskChip
            key={task.id}
            task={task}
            onClick={onTaskClick}
            prefix={getTaskDayLabel(task, date)}
          />
        ))}
        {dayTimeLogs.length > 0 && (
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
            Time logged: {formatHoursDuration(totalHours)}
          </Typography>
        )}
        {dayTimeLogs.map((timeLog) => (
          <Paper
            key={timeLog.id}
            role="button"
            tabIndex={0}
            sx={{
              p: 1,
              mb: 1,
              cursor: 'pointer',
              backgroundColor: timeLog.activity_type_color,
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

      {hours.map((hour) => (
        <Paper
          key={hour}
          variant="outlined"
          sx={{
            p: 2,
            mb: 1,
            display: 'flex',
            minHeight: 80,
            backgroundColor:
              hour % 2 === 0 ? 'background.default' : 'background.paper',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              width: 50,
              color: 'text.secondary',
              fontWeight: 'medium',
            }}
          >
            {hour.toString().padStart(2, '0')}:00
          </Typography>
          <Box sx={{ flex: 1 }}>
            {getTasksForHour(hour).map((task) => (
              <CalendarTaskChip
                key={task.id}
                task={task}
                onClick={onTaskClick}
              />
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default CalendarDayView;
