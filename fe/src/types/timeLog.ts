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
