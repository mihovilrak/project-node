import { Task } from "./task";

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
}

export interface ProjectStatus {
  id: number;
  name: string;
  color: string;
  description: string | null;
  active: boolean;
  created_on: string;
  updated_on: string | null;
}

export interface ProjectMember {
  project_id: number;
  user_id: number;
  role_id: number;
  created_on: string;
  // Virtual fields from joins
  user_name?: string;
  user_email?: string;
  role_name?: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  parent_id?: number;
  status_id: number;
  start_date: string;
  due_date: string;
}

export interface ProjectUpdate extends Partial<ProjectCreate> {
  id: number;
}

export interface ProjectFilters {
  status_id?: number;
  created_by?: number;
  start_date?: string;
  due_date?: string;
  search?: string;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  overdue_projects: number;
  total_tasks: number;
  completed_tasks: number;
  total_members: number;
  total_time_spent: number;
}

export interface ProjectDetailsState {
  project: Project | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  activeTab: number;
  editDialogOpen: boolean;
  createTaskDialogOpen: boolean;
  deleteDialogOpen: boolean;
  members: ProjectMember[];
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

export interface ProjectMembersProps {
  projectId: number;
  members: ProjectMember[];
  onMembersUpdated: () => void;
}

export interface ProjectsProps {
  // Empty for now as it doesn't take any props
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

export interface ProjectTab {
  id: number;
  label: string;
  ariaControls: string;
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
  start_date: Date | null;
  due_date: Date | null;
}
