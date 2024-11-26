export interface TimeLog {
  id: number;
  task_id: number;
  user_id: number;
  activity_type_id: number;
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
  activity_type_id: number;
  spent_time: number;
  description?: string;
}

export interface TimeLogUpdate extends Partial<TimeLogCreate> {
  id: number;
}

export interface TimeLogFilters {
  task_id?: number;
  project_id?: number;
  user_id?: number;
  activity_type_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface TimeStats {
  total_time: number;
  by_activity: ActivityStats[];
  by_project: ProjectTimeStats[];
  by_user: UserTimeStats[];
}

interface ActivityStats {
  activity_type_id: number;
  activity_type_name: string;
  total_time: number;
  percentage: number;
}

interface ProjectTimeStats {
  project_id: number;
  project_name: string;
  total_time: number;
  percentage: number;
}

interface UserTimeStats {
  user_id: number;
  user_name: string;
  total_time: number;
  percentage: number;
}

export interface DailyTimeLog {
  date: string;
  total_time: number;
  entries: TimeLog[];
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

export interface TimeEntry {
  id: number;
  user_id: number;
  task_id: number;
  hours: number;
  comments: string | null;
  spent_on: string;
  created_on: string;
}

export interface TaskAssignee {
  task_id: number;
  assignee_id: number | null;
  name: string | null;
}

export interface TaskHolder {
  task_id: number;
  holder_id: number | null;
  name: string | null;
}

export interface TimeSpent {
  task_id: number;
  spent_time: number;
}

export interface ProjectTimeSpent {
  project_id: number;
  spent_time: number;
}

export interface TimeLogFormProps {
  spentTime: number;
  description: string;
  activityTypeId: number;
  activityTypes: ActivityType[];
  onSpentTimeChange: (value: number) => void;
  onDescriptionChange: (value: string) => void;
  onActivityTypeChange: (value: number) => void;
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
