export interface TaskType {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  created_on: Date;
  updated_on: Date;
  active: boolean;
}

export interface TaskTypeCreateInput {
  name: string;
  description?: string;
  color: string;
  icon?: string;
  active?: boolean;
}

export interface TaskTypeUpdateInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  active?: boolean;
}

export interface TaskTypeWithStats extends TaskType {
  task_count: number;
  completed_tasks: number;
  in_progress_tasks: number;
}
