/**
 * Represent a user watching a task, including their numeric task and user IDs,
 * display name, and optional role.
 */
export interface TaskWatcher {
  // Only set on the row returned when a watcher is added.
  id?: number;
  created_on?: string;
  task_id: number;
  user_id: number;
  user_name: string;
  role?: string;
}

export interface WatcherListProps {
  watchers: TaskWatcher[];
  canManageWatchers: boolean;
  currentUserId?: number;
  onRemoveWatcher: (userId: number) => void;
  onManageWatchers: () => void;
}

export interface WatcherDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  currentWatchers: TaskWatcher[];
  onAddWatcher: (userId: number) => void | Promise<void>;
  onRemoveWatcher: (userId: number) => void | Promise<void>;
}
