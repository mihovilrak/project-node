import { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';
import { TimeLog } from '../../types/timeLog';
import { useTheme } from '@mui/material';

export const useTimeLogCalendar = (initialTimeLogs: TimeLog[] = []) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const theme = useTheme();

  const navigateMonth = (direction: number): void => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getTimeLogsForDate = (date: Date, timeLogs: TimeLog[]): TimeLog[] => {
    return timeLogs.filter(log => {
      const logDate = new Date(log.created_on!);
      return logDate.toDateString() === date.toDateString();
    });
  };

  const getTotalHoursForDate = (date: Date, timeLogs: TimeLog[]): number => {
    const logs = getTimeLogsForDate(date, timeLogs);
    return logs.reduce((total, log) => total + log.spent_time / 60, 0);
  };

  const getDayColor = (hours: number): string => {
    if (hours === 0) return theme.palette.background.paper;
    if (hours < 4) return theme.palette.info.light;
    if (hours < 8) return theme.palette.success.light;
    return theme.palette.warning.light;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCalendarDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getTotalMonthHours = (timeLogs: TimeLog[]): number => {
    return timeLogs.reduce((total, log) => total + log.spent_time / 60, 0);
  };

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
