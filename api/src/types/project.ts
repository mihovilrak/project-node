import { User } from './models';

export interface Project {
  id: string;
  name: string;
  description: string;
  start_date?: Date;
  due_date?: Date;
  created_by: string;
  parent_id?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectMember {
  user_id: string;
  project_id: string;
  role: string;
  user?: User;
}

export interface ProjectDetails extends Project {
  owner: User;
  members: ProjectMember[];
  tasks_count: number;
  completed_tasks_count: number;
}

export interface ProjectStatus {
  id: string;
  name: string;
  order: number;
}

export interface ProjectCreateInput {
  name: string;
  description: string;
  start_date?: Date;
  due_date?: Date;
  parent_id?: string;
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
  start_date?: Date;
  due_date?: Date;
  status?: string;
  parent_id?: string;
}

export interface ProjectTaskFilters {
  status?: string;
  priority?: string;
  assignee?: string;
}

export interface ProjectQueryFilters {
  whereParams?: Record<string, any>;
}
