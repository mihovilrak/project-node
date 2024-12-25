export interface TaskWatcher {
  task_id: number;
  user_id: number;
  user_name: string;
  role?: string;
}

export interface WatcherListProps {
  watchers: TaskWatcher[];
  canManageWatchers: boolean;
  onRemoveWatcher: (userId: number) => void;
  onManageWatchers: () => void;
}

export interface WatcherDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  currentWatchers: TaskWatcher[];
  onAddWatcher: (userId: number) => void;
  onRemoveWatcher: (userId: number) => void;
}
