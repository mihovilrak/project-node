import { SelectChangeEvent } from '@mui/material';
import { User } from './user';
import { Tag } from './tag';
import { TimeLog, TimeLogCreate } from './timeLog';
import { Comment } from './comment';
import { TaskFile } from './file';

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
  priority?: string;
  priority_name?: string;
  priority_color?: string;
  status?: string;  
  status_name?: string;
  status_color?: string;
  holder_name?: string;
  assignee_name?: string;
  created_by_name?: string;
  spent_time?: number;
  tags?: Tag[];
}

export interface TaskCoreState {
  task: Task | null;
  subtasks: Task[];
  statuses: TaskStatus[];
  loading: boolean;
  error: string | null;
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
  estimated_time: number | null;
}

export interface TaskTimeLogsProps {
  task: Task;
}

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
}

export interface TaskDetailsHeaderProps extends TaskHeaderProps {
  task: Task;
  statuses: TaskStatus[];
  statusMenuAnchor: HTMLElement | null;
  onStatusMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  onStatusMenuClose: () => void;
  onStatusChange: (statusId: number) => void;
  onDelete: () => void;
}

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
  onTimeLogSubmit: (timeLogData: TimeLogCreate) => Promise<void>;
  onTimeLogDelete: (timeLogId: number) => Promise<void>;
  onTimeLogEdit: (timeLog: TimeLog) => void;
  onTimeLogDialogClose: () => void;
  onCommentSubmit: (content: string) => Promise<void>;
  onCommentUpdate: (commentId: number, newText: string) => Promise<void>;
  onCommentDelete: (commentId: number) => Promise<void>;
  onEditStart: (comment: Comment | null) => void;
  onEditEnd: () => void;
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

export interface TaskDetailsState {
  statusMenuAnchor: HTMLElement | null;
  editingComment: Comment | null;
  timeLogDialogOpen: boolean;
  selectedTimeLog: TimeLog | null;
  watcherDialogOpen: boolean;
}
