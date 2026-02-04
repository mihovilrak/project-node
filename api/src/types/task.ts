import { User } from './user';
import { Tag } from './tag';

export interface Task {
  id: number;
  name: string;
  project_id: number;
  project_name?: string;
  holder_id?: number;
  holder_name?: string;
  assignee_id?: number;
  assignee_name?: string;
  parent_id?: number | null;
  parent_name?: string | null;
  description?: string;
  type_id: number;
  type_name?: string;
  status_id: number;
  status_name?: string;
  status_color?: string;
  priority_id: number;
  priority_name?: string;
  start_date: Date;
  due_date: Date;
  end_date?: Date | null;
  spent_time?: number;
  progress: number;
  created_by: number;
  created_by_name?: string;
  created_on: Date;
  updated_on?: Date | null;
  estimated_time?: number | null;
}

export interface TaskDetails extends Task {
  project_name: string;
  holder_name: string;
  assignee_name: string;
  created_by_name: string;
  status_name: string;
  priority_name: string;
  type_name: string;
}

export interface TaskStatus {
  id: number;
  name: string;
  color: string;
  description?: string | null;
  active?: boolean;
  created_on?: Date;
  updated_on?: Date | null;
}

export interface TaskPriority {
  id: number;
  name: string;
  color: string;
  description?: string | null;
  active: boolean;
  created_on: Date;
  updated_on?: Date | null;
}

export interface TaskType {
  id: number;
  name: string;
  color: string;
  icon?: string;
  description?: string | null;
  active: boolean;
  created_on: Date;
  updated_on?: Date | null;
}

export interface TaskCreateInput {
  name: string;
  description?: string;
  estimated_time?: number | null;
  start_date: Date;
  due_date: Date;
  end_date?: Date | null;
  priority_id: number;
  status_id: number;
  type_id: number;
  parent_id?: number | null;
  project_id: number;
  holder_id?: number;
  assignee_id?: number;
  created_by: number;
  progress?: number;
  tags?: Tag[];
  tag_ids?: number[];
  watchers?: number[];
}

export interface TaskUpdateInput {
  name?: string;
  project_id?: number;
  holder_id?: number;
  assignee_id?: number;
  description?: string;
  estimated_time?: number | null;
  status_id?: number;
  priority_id?: number;
  type_id?: number;
  start_date?: Date;
  due_date?: Date;
  end_date?: Date | null;
  progress?: number;
}

export interface TaskWatcher {
  task_id: number;
  user_id: number;
  user?: User;
}

export interface TaskQueryFilters {
  whereParams?: {
    [key: string]: number | string;
  };
  id?: number;
  project_id?: number;
  assignee_id?: number;
  holder_id?: number;
  status_id?: number;
  priority_id?: number;
  type_id?: number;
  parent_id?: number;
  created_by?: number;
  due_date_from?: string;
  due_date_to?: string;
  start_date_from?: string;
  start_date_to?: string;
  created_from?: string;
  created_to?: string;
  estimated_time_min?: number;
  estimated_time_max?: number;
  inactive_statuses_only?: boolean;
  active_statuses_only?: boolean;
}
