import React from 'react';
import dayjs from 'dayjs';
import { Box, Paper, CircularProgress, Alert } from '@mui/material';
import { getProjectTimeLogs } from '../../api/timeLogs';
import { TimeLog, TimeLogCalendarProps } from '../../types/timeLog';
import { useTimeLogCalendar } from '../../hooks/timeLog/useTimeLogCalendar';
import { useAsyncResource } from '../../hooks/common/useAsyncResource';
import TimeLogCalendarHeader from './TimeLogCalendarHeader';
import TimeLogCalendarGrid from './TimeLogCalendarGrid';

const EMPTY_TIME_LOGS: TimeLog[] = [];

const TimeLogCalendar: React.FC<TimeLogCalendarProps> = ({ projectId }) => {
  const {
    currentDate,
    navigateMonth,
    getTimeLogsForDate,
    getTotalHoursForDate,
    getDayColor,
    formatTime,
    getCalendarDays,
    getTotalMonthHours,
  } = useTimeLogCalendar();

  const month = dayjs(currentDate).format('YYYY-MM');

  const {
    data: timeLogs,
    loading,
    error,
  } = useAsyncResource<TimeLog[]>(
    async (signal) => {
      const start = dayjs(`${month}-01`);
      const logs = await getProjectTimeLogs(
        projectId,
        {
          startDate: start.format('YYYY-MM-DD'),
          endDate: start.endOf('month').format('YYYY-MM-DD'),
        },
        signal,
      );
      return logs || [];
    },
    [projectId, month],
    {
      initialData: EMPTY_TIME_LOGS,
      enabled: Boolean(projectId),
      errorMessage: 'Failed to load time logs',
    },
  );

  if (!projectId) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Project ID is required
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <TimeLogCalendarHeader
        currentDate={currentDate}
        totalHours={getTotalMonthHours(timeLogs)}
        onNavigateMonth={navigateMonth}
      />
      <TimeLogCalendarGrid
        days={getCalendarDays()}
        timeLogs={timeLogs}
        getTimeLogsForDate={getTimeLogsForDate}
        getTotalHoursForDate={getTotalHoursForDate}
        getDayColor={getDayColor}
        formatTime={formatTime}
      />
    </Paper>
  );
};

export default TimeLogCalendar;
