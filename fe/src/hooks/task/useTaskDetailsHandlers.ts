import { useState } from 'react';
import { Task, TaskDetailsState } from '../../types/task';
import { TimeLog } from '../../types/timeLog';

/**
 * Provide handlers and state management for task details UI interactions
 * including status menus, time logs, subtasks, and watchers.
 */
export const useTaskDetailsHandlers = () => {
  const [state, setState] = useState<TaskDetailsState>({
    statusMenuAnchor: null,
    timeLogDialogOpen: false,
    selectedTimeLog: null,
    watcherDialogOpen: false,
  });

  // Status Menu Handlers
  const handleStatusMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setState((prev) => ({ ...prev, statusMenuAnchor: event.currentTarget }));
  };

  const handleStatusMenuClose = () => {
    setState((prev) => ({ ...prev, statusMenuAnchor: null }));
  };

  const handleTimeLogCreate = () => {
    setState((prev) => ({
      ...prev,
      selectedTimeLog: null,
      timeLogDialogOpen: true,
    }));
  };

  const handleTimeLogEdit = (timeLog: TimeLog) => {
    setState((prev) => ({
      ...prev,
      selectedTimeLog: timeLog,
      timeLogDialogOpen: true,
    }));
  };

  const handleTimeLogDialogClose = () => {
    setState((prev) => ({
      ...prev,
      selectedTimeLog: null,
      timeLogDialogOpen: false,
    }));
  };

  // Subtask Handlers
  const handleAddSubtaskClick = (
    task: Task,
    navigate: (path: string) => void,
  ) => {
    if (task) {
      navigate(`/tasks/new?projectId=${task.project_id}&parentId=${task.id}`);
    }
  };

  const handleSubtaskUpdate = (
    subtasks: Task[],
    subtaskId: number,
    updatedSubtask: Task,
    setSubtasks: (subtasks: Task[]) => void,
  ) => {
    setSubtasks(
      subtasks.map((subtask) =>
        subtask.id === subtaskId ? updatedSubtask : subtask,
      ),
    );
  };

  const handleSubtaskDelete = (
    subtasks: Task[],
    subtaskId: number,
    setSubtasks: (subtasks: Task[]) => void,
  ) => {
    setSubtasks(subtasks.filter((subtask) => subtask.id !== subtaskId));
  };

  // Watcher Dialog Handlers
  const handleWatcherDialogOpen = () => {
    setState((prev) => ({ ...prev, watcherDialogOpen: true }));
  };

  const handleWatcherDialogClose = () => {
    setState((prev) => ({ ...prev, watcherDialogOpen: false }));
  };

  return {
    state,
    handleStatusMenuClick,
    handleStatusMenuClose,
    handleTimeLogCreate,
    handleTimeLogEdit,
    handleTimeLogDialogClose,
    handleAddSubtaskClick,
    handleSubtaskUpdate,
    handleSubtaskDelete,
    handleWatcherDialogOpen,
    handleWatcherDialogClose,
  };
};
