import { Task } from './task';
import { User } from './user';
import { Dayjs } from 'dayjs';
import {
  ValidResourceInstance,
  FormatterFn,
} from '@devexpress/dx-react-scheduler';
import { AppointmentTooltip } from '@devexpress/dx-react-scheduler-material-ui';
import { TimeLog, TimeLogCreate } from './timeLog';

/**
 * Represent a project's core metadata, scheduling, ownership, status, progress, and optional nested subprojects for frontend use.
 */
export interface Project {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date?: string | null;
  due_date: string;
  parent_id: number | null;
  parent_name: string | null;
  status_id: number;
  status_name: string;
  created_by: number;
  created_by_name: string;
  created_on: string;
  updated_on?: string | null;
  estimated_time: number;
  spent_time: number;
  progress: number;
  // Frontend-specific fields
  subprojects?: Project[];
  can_create_project?: boolean;
}

export interface ProjectMember {
  project_id: number;
  user_id: number;
  name: string;
  surname: string;
  role: string;
  created_on: string;
}

export interface ProjectEditDialogProps {
  open: boolean;
  project: Project;
  onClose: () => void;
  onSaved: (project: Project) => void;
}

export interface ProjectGanttProps {
  projectId: number;
  tasks: Task[];
}

/**
 * Supply props for a subproject creation form: the parent project ID, an async onSubmit callback receiving name, description, start_date and due_date, and an onClose handler.
 */
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

/**
 * Supply optional initial project data and handlers to submit changes or close the form.
 */
export interface ProjectFormProps {
  project?: Project;
  onSubmit?: (data: Partial<Project>) => Promise<void>;
  onClose?: () => void;
}

/**
 * Provide a task formatted for timeline views (Gantt/calendar) with Date start/end properties, assignee id, and optional type, priority, status, and description.
 */
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

/**
 * Provide the form payload used when creating or editing a subproject, containing the name, description, and optional Dayjs start and due dates.
 */
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

/**
 * Document the props used to render and interact with a project's task list, including the array of tasks and optional callbacks to create a task or start a time log for a task.
 */
export interface ProjectTaskListProps {
  tasks: Task[];
  onCreateTask?: () => void;
  onTimeLogCreate?: (taskId: number) => void;
}

/**
 * Use these props to render a tab panel that displays its children only when its index matches the current active value.
 */
export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface ProjectEditFormData extends Partial<Project> {
  name: string | undefined;
  description: string | null;
  start_date: string;
  due_date: string;
  status_id: number;
}

export interface ProjectMemberSelectProps {
  users: User[];
  selectedUsers: number[];
  onUserSelect: (userId: number) => void;
}

/**
 * Represent a project's status with a numeric identifier, a human-readable name, and an optional color value.
 */
export interface ProjectStatus {
  id: number;
  name: string;
  color?: string;
}

/**
 * Describe the runtime state used by a project details view, including loaded project data, lists, dialogs and loading/error flags.
 */
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
};

/**
 * Provide the props available to a custom appointment content component used to render a task appointment in the scheduler.
 */
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
};

export type TooltipContentComponentProps = AppointmentTooltip.ContentProps & {
  appointmentData: FormattedTask;
};

/**
 * Expose booleans and callbacks to enable editing and deleting a project from a UI.
 */
export interface ProjectActionsProps {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Provide the properties required to render and control a project's tab panels, including active tab index, project data and details, tasks, members, time logs, permission flag, project ID, and callbacks for task, member and time log actions.
 */
export interface ProjectTabPanelsProps {
  activeTab: number;
  project: Project;
  projectDetails: Project | null;
  tasks: Task[];
  members: ProjectMember[];
  timeLogs: TimeLog[];
  canManageMembers: boolean;
  projectId: string;
  onCreateTask: () => void;
  onManageMembers: () => void;
  onTimeLogCreate: (taskId: number) => void;
  onTimeLogEdit: (timeLog: TimeLog) => void;
  onTimeLogDelete: (timeLogId: number) => void;
  onMemberRemove: (userId: number) => void;
}

/**
 * Expose state and async handlers for loading, updating, and removing project members, plus control of the members management dialog.
 */
export interface ProjectMembersHook {
  members: ProjectMember[];
  setMembers: React.Dispatch<React.SetStateAction<ProjectMember[]>>;
  manageMembersOpen: boolean;
  setManageMembersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleMemberUpdate: (memberId: number, role: string) => Promise<void>;
  handleMemberRemove: (memberId: number) => Promise<void>;
  handleMembersUpdate: (selectedUsers: number[]) => Promise<void>;
  loadMembers: () => Promise<void>;
}

/**
 * Manage a project's task list state and actions, including loading tasks, creating tasks, and controlling the task form visibility.
 */
export interface ProjectTasksHook {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasksError: string | null;
  taskFormOpen: boolean;
  setTaskFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleTaskCreate: (task: Task) => Promise<void>;
  loadTasks: () => Promise<void>;
}

/**
 * Expose state and handlers to load, create, edit, delete, and select project time logs, and to control the time-log dialog visibility.
 */
export interface ProjectTimeLogsHook {
  timeLogs: TimeLog[];
  setTimeLogs: React.Dispatch<React.SetStateAction<TimeLog[]>>;
  timeLogDialogOpen: boolean;
  setTimeLogDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTimeLog: TimeLog | null;
  setSelectedTimeLog: React.Dispatch<React.SetStateAction<TimeLog | null>>;
  handleTimeLogSubmit: (timeLogData: TimeLogCreate) => Promise<void>;
  handleTimeLogEdit: (timeLog: TimeLog) => Promise<void>;
  handleTimeLogDelete: (timeLogId: number) => Promise<void>;
  loadTimeLogs: () => Promise<void>;
}

/**
 * Provide properties to configure and handle a task creation form for a given project.
 */
export interface TaskFormProps {
  projectId: number;
  open: boolean;
  onClose: () => void;
  onCreated: (task: Task) => Promise<void>;
}

/**
 * Provide properties and handlers required by a project details form, including form data, validation errors, available parent projects and statuses, loading state, and event handlers for input, status, date and parent changes, cancelation, and submission.
 */
export interface ProjectDetailsFormProps {
  formData: any;
  errors: Record<string, string>;
  dateError: string;
  availableProjects: Project[];
  parentId: string | null;
  statuses?: ProjectStatus[];
  statusesLoading?: boolean;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleStatusChange: (event: any) => void;
  handleDateChange: (
    field: 'start_date' | 'due_date',
    newValue: Dayjs | null,
  ) => void;
  handleParentChange: (e: any) => void;
  handleCancel: () => void;
  onSubmit: () => void;
}

/**
 * Provide properties and callbacks for a form that selects and submits project members.
 */
export interface ProjectMembersFormProps {
  users: User[];
  selectedUsers: number[];
  memberError: string;
  onUserSelect: (userId: number) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export interface ProjectFormData {
  name: string | undefined;
  description: string | null;
  start_date: string;
  due_date: string;
  status_id: number;
  parent_id: number | null;
}
