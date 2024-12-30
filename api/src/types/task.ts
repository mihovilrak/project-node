import { User } from './user';

export interface Task {
  id: string;
  name: string;
  description?: string;
  estimated_time?: number;
  start_date: Date;
  due_date: Date;
  end_date?: Date;
  priority_id: string;
  status_id: string;
  type_id: string;
  parent_id?: string;
  project_id: string;
  holder_id: string;
  assignee_id: string;
  created_by: string;
  created_on: Date;
  updated_on: Date;
}

export interface TaskDetails extends Task {
  project_name: string;
  holder: User;
  assignee: User;
  creator: User;
  status_name: string;
  priority_name: string;
  type_name: string;
}

export interface TaskStatus {
  id: string;
  name: string;
}

export interface TaskPriority {
  id: string;
  name: string;
}

export interface TaskType {
  id: string;
  name: string;
}

export interface TaskCreateInput {
  name: string;
  description?: string;
  estimated_time?: number | null;
  start_date: Date;
  due_date: Date;
  priority_id: string;
  status_id: string;
  type_id: string;
  parent_id?: string;
  project_id: string;
  holder_id: string;
  assignee_id: string;
  created_by: string;
  tagIds?: number[];
  tags?: Array<{ id: number; name: string; color: string; description: string | null; active: boolean; created_on: Date; }>;
}

export interface TaskUpdateInput {
  name?: string;
  project_id?: string;
  holder_id?: string;
  assignee_id?: string;
  description?: string;
  estimated_time?: number;
  status_id?: string;
  priority_id?: string;
  start_date?: Date;
  due_date?: Date;
  end_date?: Date;
}

export interface TaskWatcher {
  task_id: string;
  user_id: string;
  user?: User;
}

export interface TaskQueryFilters {
  whereParams?: {
    [key: string]: string;
  };
  project_id?: string;
  assignee_id?: string;
  holder_id?: string;
  status_id?: string;
  priority_id?: string;
  type_id?: string;
  parent_id?: string;
}
