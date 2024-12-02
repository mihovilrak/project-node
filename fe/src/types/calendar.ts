import { Task } from './task';
import { TimeLog } from './timeLog';

// Calendar view types
export type CalendarView = 'day' | 'week' | 'month';

// Calendar day structure
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  tasks: Task[];
  timeLogs: TimeLog[];
  totalTime: number;      // Total time logged in minutes
}

// Calendar view props
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
