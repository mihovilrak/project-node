import { Task } from "./task";
import { Dayjs } from 'dayjs';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  parent_name: string | null;
  status_id: number;
  status_name: string;
  start_date: string;
  due_date: string;
  created_by: number;
  created_by_name: string;
  created_on: string;
  estimated_time: number;
  spent_time: number;
  progress: number;
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
