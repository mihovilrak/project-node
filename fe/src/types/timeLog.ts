import { Dayjs } from 'dayjs';
import { Project } from './project';
import { Task } from './task';
import { User } from './user';

export interface TimeLog {
  id: number;
  task_id: number;
  user_id: number;
  activity_type_id: number;
  log_date: string;
  spent_time: number;
  description: string | null;
  created_on: string;
  updated_on: string | null;
  // Virtual fields
  task_name?: string;
  project_name?: string;
  user_name?: string;
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

export interface ActivityType {
  id: number;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  active: boolean;
  created_on: string;
  updated_on: string | null;
}

export interface TimeSpent {
  task_id: number;
  spent_time: number;
}

export interface TimeLogFormProps {
  selectedProjectId: number | null;
  selectedTaskId: number | null;
  selectedUserId: number;
  selectedActivityTypeId: number;
  spentTime: string;
  description: string;
  logDate: Dayjs;
  timeError: string;
  projects: Project[];
  tasks: Task[];
  users: User[];
  activityTypes: ActivityType[];
  showUserSelect: boolean;
  onProjectChange: (projectId: number | null) => void;
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

export interface TimeLogListProps {
  timeLogs: TimeLog[];
  onEdit?: (timeLog: TimeLog) => void;
  onDelete?: (timeLogId: number) => void;
}

export interface TimeLogStatsProps {
  timeLogs: TimeLog[];
}

export interface TaskTimeLoggingProps {
  taskId: number;
  timeLogs: TimeLog[];
  timeLogDialogOpen: boolean;
  selectedTimeLog: TimeLog | null;
  onTimeLogSubmit: (timeLogData: TimeLogCreate) => Promise<void>;
  onTimeLogDelete: (timeLogId: number) => Promise<void>;
  onTimeLogEdit: (timeLog: TimeLog) => void;
  onTimeLogDialogClose: () => void;
}
