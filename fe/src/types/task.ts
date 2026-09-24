import { SelectChangeEvent } from '@mui/material';
import { Tag } from './tag';
import { TimeLog, TimeLogCreate } from './timeLog';
import { Comment } from './comment';
import { TaskFile } from './file';
import { ProjectMember } from './project';

/**
 * Model a task including its identifiers, project and parent relationships, assignee/holder details, type/priority/status metadata, scheduling (start/due/end), time tracking, progress, and creator information.
 */
export interface Task {
  id: number;
  name: string;
  project_id: number;
  project_name: string;
  holder_id?: number;
  holder_name?: string;
  assignee_id?: number;
  assignee_name?: string;
  parent_id: number | null;
  parent_name: string | null;
  description: string;
  type_id: number;
  type_name: string;
  type_color?: string;
  type_icon?: string;
  status_id: number;
  status_name: string;
  status_color?: string;
  priority_id: number;
  priority_name: string;
  priority_color?: string;
  start_date: string | null;
  due_date: string | null;
  end_date?: string | null;
  spent_time: number;
  progress: number;
  created_by: number;
  created_by_name: string;
  created_on: string;
  estimated_time: number | null;
}

/**
 * Hold the UI state for a task view, including the current task (or null), its subtasks, available statuses, and loading/error flags.
 */
export interface TaskCoreState {
  task: Task | null;
  subtasks: Task[];
  statuses: TaskStatus[];
  loading: boolean;
  error: string | null;
}

/**
 * Provide optional filtering criteria to narrow which tasks are returned when querying or listing tasks.
 */
export interface TaskFilters {
  id?: number;
  project_id?: number | string;
  assignee_id?: number | string;
  holder_id?: number | string;
  status_id?: number | string;
  priority_id?: number | string;
  type_id?: number | string;
  parent_id?: number;
  created_by?: number | string;
  due_date_from?: string;
  due_date_to?: string;
  start_date_from?: string;
  start_date_to?: string;
  created_from?: string;
  created_to?: string;
  estimated_time_min?: number;
  estimated_time_max?: number;
  inactive_statuses_only?: boolean | 0 | 1;
  active_statuses_only?: boolean | 0 | 1;
  status?: number;
  priority?: number;
  assignee?: number;
  holder?: number;
  type?: number;
  project?: number;
  search?: string;
}

export interface TaskType {
  id: number;
  name: string;
  description?: string | null;
  color: string;
  icon?: string | null;
  created_on?: string;
  updated_on?: string | null;
  active?: boolean;
}

/**
 * Represent a task's status including its identifier, display properties (name and color), optional description, active flag, and creation/update timestamps.
 */
export interface TaskStatus {
  id: number;
  name: string;
  color: string;
  description: string | null;
  active: boolean;
  created_on: string;
  updated_on: string | null;
}

/**
 * Represent a task priority with its id, display name, color, optional description, active flag, and created/updated timestamps.
 */
export interface TaskPriority {
  id: number;
  name: string;
  color: string;
  description: string | null;
  active: boolean;
  created_on: string;
  updated_on: string | null;
}

/**
 * Provide properties to configure a task creation/edit form component and handle its lifecycle events.
 */
export interface TaskFormProps {
  taskId?: string;
  projectId: number;
  open: boolean;
  onClose: () => void;
  onCreated: (task: Task) => Promise<void>;
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

/**
 * Define the editable fields and metadata for a task creation/edit form state.
 */
export interface TaskFormState {
  name: string;
  description: string;
  project_id: number | null;
  type_id: number | null;
  priority_id: number | null;
  status_id: number | null;
  parent_id: number | null;
  holder_id: number | null;
  assignee_id: number | null;
  start_date: string | null;
  due_date: string | null;
  estimated_time: number | null;
  progress?: number;
  created_by?: number;
  tags?: Tag[];
}

export interface TaskTimeLogsProps {
  task: Task;
}

/**
 * Provide the properties required by a task header component: the task and its statuses, edit/delete permissions, the status menu anchor, and callbacks for status changes, deletion, time logging, and adding subtasks.
 */
export interface TaskHeaderProps {
  task: Task | null;
  statuses: TaskStatus[];
  canEdit: boolean;
  canDelete: boolean;
  statusMenuAnchor: HTMLElement | null;
  onStatusMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  onStatusMenuClose: () => void;
  onStatusChange: (statusId: number) => void;
  onDelete: () => void;
  onTimeLogClick: () => void;
  onAddSubtaskClick: () => void;
}

/**
 * Provide the prop types required by a task details header component, including the task data, available statuses, an optional DOM anchor for the status menu, and handlers for menu interactions, status changes, and deletion.
 */
export interface TaskDetailsHeaderProps extends TaskHeaderProps {
  task: Task;
  statuses: TaskStatus[];
  statusMenuAnchor: HTMLElement | null;
  onStatusMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  onStatusMenuClose: () => void;
  onStatusChange: (statusId: number) => void;
  onDelete: () => void;
}

/**
 * Provide the props needed to render and manage a task details view, including the task and related lists (subtasks, time logs, comments), UI state (time log dialog, selected/editing items) and callback handlers for CRUD actions and UI events.
 */
export interface TaskDetailsContentProps {
  id: string;
  task: Task;
  subtasks: Task[];
  timeLogs: TimeLog[];
  comments: Comment[];
  timeLogDialogOpen: boolean;
  selectedTimeLog: TimeLog | null;
  editingComment: Comment | null;
  onSubtaskDeleted: (subtaskId: number) => void;
  onSubtaskUpdated: (subtaskId: number, updatedSubtask: Task) => void;
  onTimeLogSubmit: (data: TimeLogCreate) => Promise<void>;
  onTimeLogDelete: (id: number) => Promise<void>;
  onTimeLogEdit: (timeLog: TimeLog) => void;
  onTimeLogDialogClose: () => void;
  onCommentSubmit: (content: string) => Promise<void>;
  onCommentUpdate: (commentId: number, text: string) => Promise<void>;
  onCommentDelete: (id: number) => Promise<void>;
  onEditStart: (comment: Comment | null) => void;
  onEditEnd: () => void;
  onAddSubtaskClick: () => void;
  onTimeLogClick: () => void;
  onCommentRefresh?: () => Promise<void>;
}

export interface TaskDetailsSidebarProps {
  id: string;
  projectId: number;
  files: TaskFile[];
  watchers: any[];
  watcherDialogOpen: boolean;
  onFileUploaded: (file: TaskFile) => void;
  onFileDeleted: (fileId: number) => Promise<void>;
  onAddWatcher: (userId: number) => void;
  onRemoveWatcher: (userId: number) => void;
  onWatcherDialogClose: () => void;
  onManageWatchers: () => void;
}

/**
 * Represent the UI state for a task details view, including the status menu anchor, the comment being edited, time log dialog visibility and selection, and watcher dialog visibility.
 */
export interface TaskDetailsState {
  statusMenuAnchor: HTMLElement | null;
  editingComment: Comment | null;
  timeLogDialogOpen: boolean;
  selectedTimeLog: TimeLog | null;
  watcherDialogOpen: boolean;
}

export interface AssigneeSelectionSectionProps {
  formData: TaskFormState;
  projectMembers: ProjectMember[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Represent a minimal change event object whose target specifies a field name and its new value.
 */
export type SimpleChangeEvent = {
  target: {
    name: string;
    value: any;
  };
};

type FormChangeHandler = (e: SimpleChangeEvent) => void;

/**
 * Provide properties for the task form's date-picker section: the form state, a change handler, and optional start/due date validation errors.
 */
export interface DatePickerSectionProps {
  formData: TaskFormState;
  handleChange: FormChangeHandler;
  errors?: { start_date?: string; due_date?: string };
}

/**
 * Provide properties for a parent-task selector component: current task form data, the list of project tasks, an input change handler, and an optional parent ID from the URL.
 */
export interface ParentTaskSelectProps {
  formData: TaskFormState;
  projectTasks: Task[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parentIdFromUrl?: string | null;
}

export interface UseTaskFormProps {
  taskId?: string;
  projectId?: string;
  projectIdFromQuery: string | null;
  parentTaskId: string | null;
  currentUserId?: number;
}
