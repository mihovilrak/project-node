import React from 'react';
import { Box, Chip, Paper, Tooltip, Typography, useTheme } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import dayjs from 'dayjs';
import { TimeLogCalendarGridProps } from '../../types/timeLog';
import { WEEKDAY_LABELS } from '../../utils/calendarUtils';

const TimeLogCalendarGrid: React.FC<TimeLogCalendarGridProps> = ({
  days,
  timeLogs,
  getTimeLogsForDate,
  getTotalHoursForDate,
  getDayColor,
  formatTime,
}) => {
  const theme = useTheme();
  const leadingBlanks = days.length > 0 ? days[0].getDay() : 0;

  return (
    <Box
      role="grid"
      data-testid="timelog-calendar-grid"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: 1,
      }}
    >
      {WEEKDAY_LABELS.map((label) => (
        <Typography
          key={label}
          role="columnheader"
          variant="subtitle2"
          align="center"
        >
          {label}
        </Typography>
      ))}
      {Array.from({ length: leadingBlanks }, (_, index) => (
        <Box key={`blank-${index}`} aria-hidden="true" />
      ))}
      {days.map((day) => {
        const totalHours = getTotalHoursForDate(day, timeLogs) || 0;
        const logs = getTimeLogsForDate(day, timeLogs) || [];
        const isToday = dayjs(day).isSame(dayjs(), 'day');

        return (
          <Box key={day.toDateString()} role="gridcell" sx={{ minWidth: 0 }}>
            <Tooltip
              title={
                <Box data-testid="timelog-tooltip">
                  <Typography variant="subtitle2">
                    {dayjs(day).format('MMMM D, YYYY')}
                  </Typography>
                  {logs.map((log) => (
                    <Typography key={log.id} variant="body2">
                      {log.task_name || 'Unknown Task'}:{' '}
                      {formatTime(log.spent_time || 0)}
                    </Typography>
                  ))}
                </Box>
              }
            >
              <Paper
                data-testid="timelog-day-paper"
                elevation={isToday ? 3 : 1}
                sx={{
                  p: 1,
                  height: '100px',
                  backgroundColor: getDayColor(totalHours),
                  border: isToday
                    ? `2px solid ${theme.palette.primary.main}`
                    : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                <Typography variant="caption">
                  {dayjs(day).format('D')}
                </Typography>
                {totalHours > 0 ? (
                  <Chip
                    size="small"
                    icon={<AccessTime />}
                    label={formatTime(totalHours)}
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      maxWidth: 'calc(100% - 8px)',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                    }}
                  />
                ) : null}
              </Paper>
            </Tooltip>
          </Box>
        );
      })}
    </Box>
  );
};

export default TimeLogCalendarGrid;
