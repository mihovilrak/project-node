import { Task } from '../../types/task';
import { TimeLog } from '../../types/timeLog';
import {
  getTasksForDay as tasksForDay,
  getTimeLogsForDay as timeLogsForDay,
} from '../../utils/calendarUtils';

/**
 * Retrieve tasks and time logs for each day of a calendar week.
 *
 * @param date The reference date to determine the week boundaries.
 * @param tasks An array of task objects to filter by week days.
 * @param timeLogs An array of time log objects to filter by week days.
 */
export const useCalendarWeek = (
  date: Date,
  tasks: Task[],
  timeLogs: TimeLog[],
) => {
  const getWeekDays = (): Date[] => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(date);
      day.setDate(day.getDate() - day.getDay() + i);
      return day;
    });
  };

  const getTasksForDay = (day: Date): Task[] => tasksForDay(tasks, day);

  const getTimeLogsForDay = (day: Date): TimeLog[] =>
    timeLogsForDay(timeLogs, day);

  return {
    getWeekDays,
    getTasksForDay,
    getTimeLogsForDay,
  };
};
