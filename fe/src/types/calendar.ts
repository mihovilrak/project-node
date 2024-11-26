import { Task } from './task';
import { TimeLog } from './timeLog';

// Calendar view types
export type CalendarView = 'day' | 'week' | 'month';

// Calendar date formatting options
export interface ViewOptions {
  day: Intl.DateTimeFormatOptions;
  week: Intl.DateTimeFormatOptions;
  month: Intl.DateTimeFormatOptions;
}

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

// Calendar week structure
export interface CalendarWeek {
  days: CalendarDay[];
  weekNumber: number;
  totalTime: number;      // Total time logged in minutes
}

// Calendar month structure
export interface CalendarMonth {
  weeks: CalendarWeek[];
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

// Calendar navigation props
export interface CalendarNavigationProps {
  date: Date;
  view: CalendarView;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

// Calendar toolbar props
export interface CalendarToolbarProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  showViewSelector?: boolean;
  actions?: React.ReactNode;
}

// Calendar task item props
export interface CalendarTaskItemProps {
  task: Task;
  onClick: (taskId: number) => void;
  compact?: boolean;
}

// Calendar time log item props
export interface CalendarTimeLogItemProps {
  timeLog: TimeLog;
  onClick: (timeLogId: number) => void;
  compact?: boolean;
}

// Calendar filters
export interface CalendarFilters {
  projectId?: number;
  userId?: number;
  taskTypeId?: number;
  activityTypeId?: number;
}

// Calendar data fetch params
export interface CalendarFetchParams {
  startDate: string;      // ISO date string
  endDate: string;        // ISO date string
  view: CalendarView;
  filters?: CalendarFilters;
}

// Calendar cell props
export interface CalendarCellProps {
  day: CalendarDay;
  view: CalendarView;
  onTaskClick: (taskId: number) => void;
  onTimeLogClick: (timeLogId: number) => void;
}

// Calendar header props
export interface CalendarHeaderProps {
  view: CalendarView;
  dates: Date[];
  showWeekNumbers?: boolean;
}

// Calendar state
export interface CalendarState {
  currentDate: Date;
  currentView: CalendarView;
  selectedDate: Date | null;
  tasks: Task[];
  timeLogs: TimeLog[];
  loading: boolean;
  error: string | null;
  filters: CalendarFilters;
}

// Calendar context
export interface CalendarContext {
  state: CalendarState;
  dispatch: React.Dispatch<CalendarAction>;
}

// Calendar actions
export type CalendarAction =
  | { type: 'SET_DATE'; payload: Date }
  | { type: 'SET_VIEW'; payload: CalendarView }
  | { type: 'SET_SELECTED_DATE'; payload: Date | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_TIME_LOGS'; payload: TimeLog[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: CalendarFilters }
  | { type: 'RESET' }; 