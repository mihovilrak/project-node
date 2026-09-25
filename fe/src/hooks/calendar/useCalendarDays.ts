import { Task } from '../../types/task';
import { TimeLog } from '../../types/timeLog';
import { CalendarDay } from '../../types/calendar';
import {
  getTasksForDay as tasksForDay,
  getTimeLogsForDay as timeLogsForDay,
  sumHours,
} from '../../utils/calendarUtils';

/**
 * Generate a 6-week month grid (Sunday first) including the adjacent months'
 * days, with each day's tasks, time logs and total logged hours.
 *
 * @param date Any day in the month to display.
 * @param tasks Tasks to place on their start, due and end dates.
 * @param timeLogs Time logs to place on their `log_date`.
 */
export const useCalendarDays = (
  date: Date,
  tasks: Task[],
  timeLogs: TimeLog[],
) => {
  const getTasksForDay = (day: Date): Task[] => tasksForDay(tasks, day);

  const getTimeLogsForDay = (day: Date): TimeLog[] =>
    timeLogsForDay(timeLogs, day);

  /**
   * Sum of `spent_time` in hours (decimal).
   */
  const calculateTotalTime = (dayTimeLogs: TimeLog[]): number =>
    sumHours(dayTimeLogs);

  const buildDay = (day: Date, isCurrentMonth: boolean): CalendarDay => {
    const dayLogs = getTimeLogsForDay(day);
    return {
      date: day,
      isCurrentMonth,
      isToday: day.toDateString() === new Date().toDateString(),
      isWeekend: day.getDay() === 0 || day.getDay() === 6,
      tasks: getTasksForDay(day),
      timeLogs: dayLogs,
      totalTime: calculateTotalTime(dayLogs),
    };
  };

  const getDaysInMonth = (): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(year, month, 1 - firstWeekday + index);
      return buildDay(day, day.getMonth() === month);
    });
  };

  return {
    getDaysInMonth,
    getTasksForDay,
    getTimeLogsForDay,
    calculateTotalTime,
  };
};
