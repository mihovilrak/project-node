import { Task } from '../../types/task';
import { TimeLog } from '../../types/timeLog';
import { CalendarDay } from '../../types/calendar';

export const useCalendarDays = (date: Date, tasks: Task[], timeLogs: TimeLog[]) => {
  const getDaysInMonth = (): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];

    // Add days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: prevDate.getDay() === 0 || prevDate.getDay() === 6,
        tasks: getTasksForDay(prevDate),
        timeLogs: getTimeLogsForDay(prevDate),
        totalTime: calculateTotalTime(getTimeLogsForDay(prevDate))
      });
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
        tasks: getTasksForDay(currentDate),
        timeLogs: getTimeLogsForDay(currentDate),
        totalTime: calculateTotalTime(getTimeLogsForDay(currentDate))
      });
    }

    // Add days from next month
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6,
        tasks: getTasksForDay(nextDate),
        timeLogs: getTimeLogsForDay(nextDate),
        totalTime: calculateTotalTime(getTimeLogsForDay(nextDate))
      });
    }

    return days;
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

  const calculateTotalTime = (dayTimeLogs: TimeLog[]): number => {
    return dayTimeLogs.reduce((total, log) => {
      const hours = typeof log.spent_time === 'string' ? parseFloat(log.spent_time) : log.spent_time;
      return total + (hours || 0);
    }, 0);
  };

  return {
    getDaysInMonth,
    getTasksForDay,
    getTimeLogsForDay,
    calculateTotalTime
  };
};
