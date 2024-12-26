import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getProjectTimeLogs } from '../../api/timeLogs';
import { TimeLog, TimeLogCalendarProps } from '../../types/timeLog';
import { useTimeLogCalendar } from '../../hooks/timeLog/useTimeLogCalendar';
import TimeLogCalendarHeader from './TimeLogCalendarHeader';
import TimeLogCalendarGrid from './TimeLogCalendarGrid';

const TimeLogCalendar: React.FC<TimeLogCalendarProps> = ({ projectId }) => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchTimeLogs();
  }, [currentDate]);

  const fetchTimeLogs = async (): Promise<void> => {
    try {
      setLoading(true);
      const logs = await getProjectTimeLogs(projectId);
      setTimeLogs(logs);
    } catch (error) {
      console.error('Failed to fetch time logs:', error);
      setError('Failed to load time logs');
    } finally {
      setLoading(false);
    }
  };

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
