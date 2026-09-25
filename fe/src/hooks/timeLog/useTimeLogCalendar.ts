import { useState } from 'react';
import dayjs from 'dayjs';
import { TimeLog } from '../../types/timeLog';
import { useTheme } from '@mui/material';
import { getTimeLogsForDay, sumHours } from '../../utils/calendarUtils';
import { formatHoursDuration } from '../../utils/timeUtils';

/**
 * Manage calendar state and calculations for displaying time logs across a
 * monthly grid.
 *
 * @param initialTimeLogs Array of time log entries to populate the calendar;
 *   defaults to an empty array.
 */
export const useTimeLogCalendar = (initialTimeLogs: TimeLog[] = []) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const theme = useTheme();

  const navigateMonth = (direction: 'next' | 'prev') => {
    setCurrentDate((current) => {
      const base = dayjs(current);
      const shifted =
        direction === 'next' ? base.add(1, 'month') : base.subtract(1, 'month');
      return shifted.toDate();
    });
  };

  const getTimeLogsForDate = (date: Date, timeLogs: TimeLog[]): TimeLog[] =>
    getTimeLogsForDay(timeLogs, date);

  const getTotalHoursForDate = (date: Date, timeLogs: TimeLog[]): number =>
    sumHours(getTimeLogsForDay(timeLogs, date));

  const getDayColor = (hours: number): string => {
    if (hours === 0) return theme.palette.background.paper;
    if (hours < 4) return theme.palette.info.light;
    if (hours < 8) return theme.palette.success.light;
    return theme.palette.warning.light;
  };

  const formatTime = (time: string | number): string =>
    formatHoursDuration(time);

  const getCalendarDays = () => {
    const month = dayjs(currentDate).startOf('month');
    return Array.from({ length: month.daysInMonth() }, (_, index) =>
      month.date(index + 1).toDate(),
    );
  };

  const getTotalMonthHours = (timeLogs: TimeLog[]): number =>
    sumHours(timeLogs);

  return {
    currentDate,
    navigateMonth,
    getTimeLogsForDate,
    getTotalHoursForDate,
    getDayColor,
    formatTime,
    getCalendarDays,
    getTotalMonthHours,
  };
};
