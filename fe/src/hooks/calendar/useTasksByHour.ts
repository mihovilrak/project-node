import { Task } from '../../types/task';
import { toLocalDate } from '../../utils/dateUtils';
import { TimeLog } from '../../types/timeLog';

export const useTasksByHour = (tasks: Task[], timeLogs: TimeLog[]) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Ensure tasks and timeLogs are always arrays
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeTimeLogs = Array.isArray(timeLogs) ? timeLogs : [];

  const getTasksForHour = (hour: number): Task[] => {
    return safeTasks.filter((task) => {
      const taskDate = toLocalDate(task.start_date);
      if (!taskDate) return false;
      return taskDate.getHours() === hour;
    });
  };

  const getTimeLogsForHour = (hour: number): TimeLog[] => {
    return safeTimeLogs.filter((timeLog) => {
      const logDate = new Date(timeLog.created_on);
      return logDate.getHours() === hour;
    });
  };

  return {
    hours,
    getTasksForHour,
    getTimeLogsForHour,
  };
};
