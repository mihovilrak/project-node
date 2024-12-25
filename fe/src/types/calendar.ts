import { Task } from './task';
import { TimeLog } from './timeLog';

export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  tasks: Task[];
  timeLogs: TimeLog[];
  totalTime: number;
}

export interface CalendarViewProps {
  date: Date;
  view: CalendarView;
  tasks: Task[];
  timeLogs: TimeLog[];
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onTaskClick: (taskId: number) => void;
  onTimeLogClick: (timeLogId: number) => void;
}
