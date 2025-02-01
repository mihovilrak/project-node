export interface TaskType {
  id: number;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  active: boolean;
  created_on: Date;
  updated_on?: Date;
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
