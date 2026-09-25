import { useState, useMemo } from 'react';
import { Task } from '../../types/task';
import { getTasksByDateRange } from '../../api/tasks';
import { getMyTimeLogs } from '../../api/timeLogs';
import { toDateOnlyString } from '../../utils/dateUtils';
import { TimeLog } from '../../types/timeLog';
import { CalendarView } from '../../types/calendar';
import { useNavigate } from 'react-router-dom';
import { useAsyncResource } from '../common/useAsyncResource';

const EMPTY_TASKS: Task[] = [];
const EMPTY_TIME_LOGS: TimeLog[] = [];

const getRange = (selectedDate: Date, view: CalendarView) => {
  const start = new Date(selectedDate);
  const end = new Date(selectedDate);

  if (view === 'month') {
    // Cover the whole 6-week grid, including the adjacent months' days.
    start.setDate(1);
    start.setDate(1 - start.getDay());
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 41);
  } else if (view === 'week') {
    start.setDate(start.getDate() - start.getDay());
    end.setDate(end.getDate() + (6 - end.getDay()));
  }

  return { start, end };
};

/**
 * Manage calendar view state, selected date, and fetch tasks and the user's own
 * time logs for the visible date range.
 */
export const useCalendar = () => {
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  const { start, end } = useMemo(
    () => getRange(selectedDate, view),
    [selectedDate, view],
  );

  const {
    data: tasks,
    loading,
    error,
  } = useAsyncResource<Task[]>(
    async (signal) => (await getTasksByDateRange(start, end, signal)) || [],
    [start, end],
    {
      initialData: EMPTY_TASKS,
      errorMessage: 'Failed to load calendar tasks',
    },
  );

  const { data: timeLogs, error: timeLogsError } = useAsyncResource<TimeLog[]>(
    async (signal) =>
      (await getMyTimeLogs(
        {
          startDate: toDateOnlyString(start),
          endDate: toDateOnlyString(end),
        },
        signal,
      )) || [],
    [start, end],
    {
      initialData: EMPTY_TIME_LOGS,
      errorMessage: 'Failed to load time logs',
    },
  );

  const handleDateChange = (newDate: Date): void => {
    setSelectedDate(newDate);
  };

  const handleViewChange = (newView: CalendarView): void => {
    setView(newView);
  };

  const handleTaskClick = (taskId: number): void => {
    navigate(`/tasks/${taskId}`);
  };

  // Time logs have no page of their own; open the task they belong to.
  const handleTimeLogClick = (timeLogId: number): void => {
    const log = timeLogs.find((entry) => entry.id === timeLogId);
    if (log?.task_id) navigate(`/tasks/${log.task_id}`);
  };

  return {
    tasks,
    loading,
    error: error ?? timeLogsError,
    view,
    selectedDate,
    timeLogs,
    handleDateChange,
    handleViewChange,
    handleTaskClick,
    handleTimeLogClick,
  };
};
