import { Task } from '../../types/task';
import { toLocalDate } from '../../utils/dateUtils';
import { TimeLog } from '../../types/timeLog';

export const useCalendarWeek = (
  date: Date,
  tasks: Task[],
  timeLogs: TimeLog[],
) => {
  // Ensure tasks and timeLogs are always arrays
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeTimeLogs = Array.isArray(timeLogs) ? timeLogs : [];

  const getWeekDays = (): Date[] => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(date);
      day.setDate(day.getDate() - day.getDay() + i);
      return day;
    });
  };

  const getTasksForDay = (day: Date): Task[] => {
    return safeTasks.filter((task) => {
      const startDate = toLocalDate(task.start_date);
      const endDate = toLocalDate(task.end_date);
      const dueDate = toLocalDate(task.due_date);

      return (
        (startDate && startDate.toDateString() === day.toDateString()) ||
        (endDate && endDate.toDateString() === day.toDateString()) ||
        (dueDate && dueDate.toDateString() === day.toDateString())
      );
    });
  };

  const getTimeLogsForDay = (day: Date): TimeLog[] => {
    return safeTimeLogs.filter((timeLog) => {
      const logDate = new Date(timeLog.created_on);
      return logDate.toDateString() === day.toDateString();
    });
  };

  return {
    getWeekDays,
    getTasksForDay,
    getTimeLogsForDay,
  };
};
