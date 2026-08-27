import { useState, useEffect } from 'react';
import { Task } from '../../types/task';
import { getTasksByDateRange } from '../../api/tasks';
import { TimeLog } from '../../types/timeLog';
import { CalendarView } from '../../types/calendar';
import { useNavigate } from 'react-router-dom';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

export const useCalendar = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const navigate = useNavigate();

  const handleDateChange = (newDate: Date): void => {
    setSelectedDate(newDate);
  };

  const handleViewChange = (newView: CalendarView): void => {
    setView(newView);
  };

  const handleTaskClick = (taskId: number): void => {
    navigate(`/tasks/${taskId}`);
  };

  const handleTimeLogClick = (timeLogId: number): void => {
    navigate(`/time-logs/${timeLogId}`);
  };

  const fetchTasks = async (start: Date, end: Date): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await getTasksByDateRange(start, end);
      setTasks(tasksData || []);
    } catch (err: unknown) {
      logger.error('Failed to fetch tasks:', err);
      setTasks([]);
      setError(getApiErrorMessage(err, 'Failed to load calendar tasks'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (view === 'month') {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    } else if (view === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(end.getDate() + (6 - end.getDay()));
    }

    fetchTasks(start, end);
  }, [selectedDate, view]);

  return {
    tasks,
    loading,
    error,
    view,
    selectedDate,
    timeLogs,
    handleDateChange,
    handleViewChange,
    handleTaskClick,
    handleTimeLogClick,
  };
};
