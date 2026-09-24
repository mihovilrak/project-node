import { Dayjs } from 'dayjs';
import { Project } from './project';
import { Task } from './task';
import { User } from './user';
import { ActivityType } from './setting';

export type { ActivityType } from './setting';

/**
 * Represent a time log entry including core identifiers, logged date and duration, optional description, audit timestamps, and optional display metadata.
 */
export interface TimeLog {
  id: number;
  task_id: number;
  user_id: number;
  activity_type_id: number;
  log_date: string;
  spent_time: number;
  description?: string;
  created_on: string;
  updated_on?: string | null;
  // Virtual fields
  task_name?: string;
  project_name?: string;
  user?: string;
  activity_type_name?: string;
  activity_type_color?: string;
  activity_type_icon?: string;
}

export interface TimeLogCreate {
  task_id: number;
  user_id?: number;
  activity_type_id: number;
  log_date: string;
  spent_time: number;
  description?: string;
}

export interface TimeSpent {
  spent_time: number;
}

/**
 * Provide all data and callbacks needed to render and manage a time-entry form: option lists (projects, tasks, activity types, users), current selections and inputs (project/task/user/activity, spentTime, description, logDate), optional read-only flags, validation error, and change handlers.
 */
export interface TimeLogFormProps {
  projects: Project[];
  tasks: Task[];
  activityTypes: ActivityType[];
  users: User[];
  selectedProjectId: number | null;
  selectedTaskId: number | null;
  selectedUserId: number;
  selectedActivityTypeId: number;
  spentTime: string;
  description: string;
  logDate: Dayjs;
  timeError: string | null;
  showUserSelect: boolean;
  isProjectReadOnly?: boolean;
  isTaskReadOnly?: boolean;
  onProjectChange: (projectId: number | null, tasks: Task[]) => void;
  onTaskChange: (taskId: number | null, tasks: Task[]) => void;
  onUserChange: (userId: number) => void;
  onActivityTypeChange: (typeId: number) => void;
  onSpentTimeChange: (time: string) => void;
  onDescriptionChange: (desc: string) => void;
  onDateChange: (date: Dayjs | null) => void;
}

export interface TimeLogDialogProps {
  open: boolean;
  projectId?: number;
  taskId?: number;
  timeLog: TimeLog | null;
  onClose: () => void;
  onSubmit: (timeLog: TimeLogCreate) => Promise<void>;
}

export interface TimeLogDashboardProps {
  taskId: number;
}

export interface TimeLogChartProps {
  timeLogs: TimeLog[];
  activityTypes: ActivityType[];
}

/**
 * Represent a chart data point containing the label, total hours, and display color for visualization.
 */
export interface ChartData {
  name: string;
  hours: number;
  color: string;
}

export interface TimeLogCalendarProps {
  projectId: number;
}

export interface ExtendedTimeLogFormProps extends TimeLogFormProps {
  activityTypes: ActivityType[];
}

/**
 * Provide props for a TimeLog list component, including the list of time logs and optional callbacks to edit or delete entries.
 */
export interface TimeLogListProps {
  timeLogs: TimeLog[];
  onEdit?: (timeLog: TimeLog) => void;
  onDelete?: (timeLogId: number) => void;
}

export interface TimeLogStatsProps {
  timeLogs: TimeLog[];
}

/**
 * Provide the props required by a component to display and manage time logs for a single task, including data, dialog state, and handlers for submit, delete, edit, and dialog close.
 */
export interface TaskTimeLoggingProps {
  taskId: number;
  projectId: number;
  timeLogs: TimeLog[];
  timeLogDialogOpen: boolean;
  selectedTimeLog: TimeLog | null;
  onTimeLogSubmit: (data: TimeLogCreate) => Promise<void>;
  onTimeLogDelete: (id: number) => Promise<void>;
  onTimeLogEdit: (timeLog: TimeLog) => void;
  onTimeLogDialogClose: () => void;
}

/**
 * Supply the date list, time log entries, and helper functions to obtain logs for a date, compute total hours, determine a day's color by hours, and format time values for a calendar grid.
 */
export interface TimeLogCalendarGridProps {
  days: Date[];
  timeLogs: TimeLog[];
  getTimeLogsForDate: (date: Date, timeLogs: TimeLog[]) => TimeLog[];
  getTotalHoursForDate: (date: Date, timeLogs: TimeLog[]) => number;
  getDayColor: (hours: number) => string;
  formatTime: (time: string | number) => string;
}

/**
 * Provide props for a calendar header component to display the current date, total logged hours, and handle month navigation.
 */
export interface TimeLogCalendarHeaderProps {
  currentDate: Date;
  totalHours: number;
  onNavigateMonth: (direction: 'next' | 'prev') => void;
}

/**
 * Specify the inputs that control time log data loading and UI behavior: whether the log view is open, an optional project scope, and if the current user has admin permissions.
 */
export interface UseTimeLogDataProps {
  open: boolean;
  projectId?: number;
  hasAdminPermission: boolean;
}

export interface UseTimeLogDialogProps {
  timeLog?: TimeLog;
  currentUser: User | null;
  onSubmit: (data: TimeLogCreate) => Promise<void>;
  onClose: () => void;
  open: boolean;
  projectId?: number;
  taskId?: number;
  hasAdminPermission: boolean;
}
