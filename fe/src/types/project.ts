import { Task } from "./task";
import { User } from "./user";
import { Dayjs } from 'dayjs';
import {
  ValidResourceInstance,
  FormatterFn
} from '@devexpress/dx-react-scheduler';
import {
  AppointmentTooltip
} from '@devexpress/dx-react-scheduler-material-ui';
import { TimeLog } from "./timeLog";

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

export interface ProjectMembersListProps {
  projectId: number;
  members: ProjectMember[];
  canManageMembers: boolean;
  onMemberRemove: (userId: number) => void;
  onMemberUpdate?: (memberId: number, role: string) => Promise<void>;
  onMembersChange?: () => void;
}

export interface EditMembersDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  currentMembers: ProjectMember[];
  onSave: (selectedUsers: number[]) => void;
}

export interface ProjectOverviewProps {
  project: Project | null;
  projectDetails: Project | null;
}

export interface ProjectTaskListProps {
  tasks: Task[];
  onCreateTask?: () => void;
  onTimeLogCreate?: (taskId: number) => void;
}

export interface EditMembersDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  currentMembers: ProjectMember[];
  onSave: (selectedUsers: number[]) => void;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface FormData extends Partial<Project> {
  name: string;
  description: string | null;
  start_date: string;
  due_date: string;
}

export interface ProjectMemberSelectProps {
  users: User[];
  selectedUsers: number[];
  onUserSelect: (userId: number) => void;
}

export interface ProjectDetailsState {
  project: Project | null;
  projectDetails: Project | null;
  members: ProjectMember[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  editDialogOpen: boolean;
  deleteDialogOpen: boolean;
  createTaskDialogOpen: boolean;
  membersDialogOpen: boolean;
  timeLogs: TimeLog[];
}

export type AppointmentComponentProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  data: FormattedTask;
  draggable: boolean;
  resources: ValidResourceInstance[];
  [key: string]: any;
}

export type AppointmentContentComponentProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  data: FormattedTask;
  formatDate: FormatterFn;
  type: 'horizontal' | 'vertical';
  durationType: 'long' | 'short' | 'middle';
  recurringIconComponent: React.ComponentType<object>;
  resources: ValidResourceInstance[];
  [key: string]: any;
}

export type TooltipContentComponentProps = AppointmentTooltip.ContentProps & {
  appointmentData: FormattedTask;
}