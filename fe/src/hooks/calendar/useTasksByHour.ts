import { Task } from '../../types/task';
import { toLocalDate } from '../../utils/dateUtils';
import { TimeLog } from '../../types/timeLog';
import {
  getTasksForDay,
  getTimeLogsForDay,
  hasTimeOfDay,
  isSameLocalDay,
  sumHours,
} from '../../utils/calendarUtils';

/**
 * Split a day's tasks into hourly slots and an all-day list.
 *
 * Task dates without a time of day (the usual case, since they are `date`
 * columns) go to `allDayTasks` instead of the 00:00 slot. Time logs only carry
 * a date, so they are returned per day rather than per hour.
 *
 * @param tasks Tasks to place.
 * @param timeLogs Time logs to place by `log_date`.
 * @param date Day to show; when omitted nothing is filtered by day.
 */
export const useTasksByHour = (
  tasks: Task[],
  timeLogs: TimeLog[],
  date?: Date,
) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeTimeLogs = Array.isArray(timeLogs) ? timeLogs : [];

  const dayTasks = date ? getTasksForDay(safeTasks, date) : safeTasks;
  const dayTimeLogs = date
    ? getTimeLogsForDay(safeTimeLogs, date)
    : safeTimeLogs;

  // A timed task only gets an hour slot on the day it starts; on its due/end
  // day it is listed with the all-day tasks.
  const isTimed = (task: Task) =>
    hasTimeOfDay(task.start_date) &&
    (!date || isSameLocalDay(task.start_date, date));

  const allDayTasks = dayTasks.filter((task) => !isTimed(task));

  const getTasksForHour = (hour: number): Task[] =>
    dayTasks.filter((task) => {
      if (!isTimed(task)) return false;
      const start = toLocalDate(task.start_date);
      return start !== null && start.getHours() === hour;
    });

  return {
    hours,
    allDayTasks,
    dayTimeLogs,
    totalHours: sumHours(dayTimeLogs),
    getTasksForHour,
  };
};
