import { SelectChangeEvent } from '@mui/material';
import { User } from './user';
import { Tag } from './tags';

export interface Task {
  id: number;
  name: string;
  description: string | null;
  project_id: number;
  type_id: number;
  priority_id: number;
  status_id: number;
  parent_id: number | null;
  parent_name?: string | null;
  holder_id: number;
  assignee_id: number | null;
  start_date: string;
  due_date: string;
  estimated_time: number | null;
  created_by: number;
  created_on: string;
  updated_on: string | null;
  project_name?: string;
  type_name?: string;
  type_color?: string;
  type_icon?: string;
  priority_name?: string;
  priority_color?: string;
  status_name?: string;
  status_color?: string;
  holder_name?: string;
  assignee_name?: string;
  creator_name?: string;
  tags?: Tag[];
}

export interface TaskFilters {
  status?: number;
  priority?: number;
  assignee?: number;
  holder?: number;
  type?: number;
  project?: number;
  search?: string;
  [key: string]: any;
}

export interface TaskType {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

export interface TaskStatus {
  id: number;
  name: string;
  color: string;
  description: string | null;
  active: boolean;
  created_on: string;
  updated_on: string | null;
}

export interface TaskPriority {
  id: number;
  name: string;
  color: string;
  description: string | null;
  active: boolean;
  created_on: string;
  updated_on: string | null;
}

export interface TaskTableProps {
  tasks: Task[];
  loading: boolean;
  priorities: TaskPriority[];
  statuses: TaskStatus[];
  users: User[];
  taskTypes: TaskType[];
}

export interface TaskListProps {
  tasks: Task[];
  onTaskUpdated: () => void;
  projectId: number;
}

export interface TaskFormProps {
  taskId?: string;
  open: boolean;
  projectId?: number;
  onClose: () => void;
  onCreated: () => void;
}
export interface TaskTypeSelectProps {
  value: number;
  onChange: (event: SelectChangeEvent<number>) => void;
  error?: boolean;
  required?: boolean;
}

export interface SubtaskListProps {
  subtasks: Task[];
  parentTaskId: number;
  onSubtaskUpdated: (subtaskId: number, updatedSubtask: Task) => void;
  onSubtaskDeleted: (subtaskId: number) => void;
}

export interface TaskFormState {
  name: string;
  description: string | null;
  start_date: string;
  due_date: string;
  priority_id: number;
  status_id: number;
  type_id: number;
  parent_id: number | null;
  project_id: number;
  holder_id: number;
  assignee_id: number | null;
  created_by?: number;
  tags: Tag[];
}
