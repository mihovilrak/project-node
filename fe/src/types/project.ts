import { Task } from "./task";
import { Dayjs } from 'dayjs';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  status_id: number;
  start_date: string;
  due_date: string;
  created_by: number;
  created_on: string;
  updated_on: string | null;
  // Virtual fields
  status_name?: string;
  status_color?: string;
  creator_name?: string;
  parent_name?: string;
  progress?: number;
  total_tasks?: number;
  completed_tasks?: number;
  spent_time?: number;
  subprojects?: Project[];
}

export interface ProjectMember {
  project_id: number;
  user_id: number;
  role_id: number;
  created_on: string;
  // Virtual fields from joins
  name?: string;
  surname?: string;
  role?: string;
}
export interface ProjectEditDialogProps {
  open: boolean;
  project: Project;
  onClose: () => void;
  onSaved: () => void;
}

export interface ProjectGanttProps {
  projectId: number;
  tasks: Task[];
}

export interface SubprojectFormProps {
  projectId: number;
  onSubmit: (data: {
    name: string;
    description: string;
    start_date: string;
    due_date: string;
  }) => Promise<void>;
  onClose: () => void;
}

export interface ProjectFormProps {
  project?: Project;
  onSubmit?: (data: Partial<Project>) => Promise<void>;
  onClose?: () => void;
}

export interface FormattedTask {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  assigneeId: number | null;
  type_name?: string;
  priority?: string;
  status?: string;
  description?: string | null;
}

export interface SubprojectFormData {
  name: string;
  description: string;
  start_date: Dayjs | null;
  due_date: Dayjs | null;
}
