import { Task } from '../../types/task';
import { TimeLog } from '../../types/timeLog';

export const useCalendarWeek = (date: Date, tasks: Task[], timeLogs: TimeLog[]) => {
  const getWeekDays = (): Date[] => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(date);
      day.setDate(day.getDate() - day.getDay() + i);
      return day;
    });
  };

  const getTasksForDay = (day: Date): Task[] => {
    return tasks.filter(task => {
      const startDate = task.start_date ? new Date(task.start_date) : null;
      const endDate = task.end_date ? new Date(task.end_date) : null;
      const dueDate = task.due_date ? new Date(task.due_date) : null;

      return (startDate && startDate.toDateString() === day.toDateString()) ||
             (endDate && endDate.toDateString() === day.toDateString()) ||
             (dueDate && dueDate.toDateString() === day.toDateString());
    });
  };

  const getTimeLogsForDay = (day: Date): TimeLog[] => {
    return timeLogs.filter(timeLog => {
      const logDate = new Date(timeLog.created_on);
      return logDate.toDateString() === day.toDateString();
    });
  };

  return {
    getWeekDays,
    getTasksForDay,
    getTimeLogsForDay
  };
};
