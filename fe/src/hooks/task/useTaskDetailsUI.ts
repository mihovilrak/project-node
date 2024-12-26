import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Comment } from '../../types/comment';
import { TimeLog } from '../../types/timeLog';
import { Task } from '../../types/task';
import { TaskFile } from '../../types/file';

export const useTaskDetailsUI = () => {
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [timeLogDialogOpen, setTimeLogDialogOpen] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);
  const [watcherDialogOpen, setWatcherDialogOpen] = useState(false);

  const navigate = useNavigate();

  // Status Menu Handlers
  const handleStatusMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
  };

  // Navigation Handlers
  const handleAddSubtask = (task: Task) => {
    navigate(`/tasks/new?projectId=${task.project_id}&parentTaskId=${task.id}`);
  };

  // Subtask State Handlers
  const handleSubtaskUpdated = (subtasks: Task[], subtaskId: number, updatedSubtask: Task) => {
    return subtasks.map(subtask =>
      subtask.id === subtaskId ? updatedSubtask : subtask
    );
  };

  const handleSubtaskDeleted = (subtasks: Task[], subtaskId: number) => {
    return subtasks.filter(subtask => subtask.id !== subtaskId);
  };

  // File State Handlers
  const handleFileUploaded = (files: TaskFile[], file: TaskFile) => {
    return [...files, file];
  };

  // Time Log Dialog Handlers
  const handleTimeLogEdit = (timeLog: TimeLog) => {
    setSelectedTimeLog(timeLog);
    setTimeLogDialogOpen(true);
  };

  const handleTimeLogDialogClose = () => {
    setTimeLogDialogOpen(false);
    setSelectedTimeLog(null);
  };

  return {
    // State
    statusMenuAnchor,
    editingComment,
    timeLogDialogOpen,
    selectedTimeLog,
    watcherDialogOpen,

    // Setters
    setEditingComment,
    setWatcherDialogOpen,
    setTimeLogDialogOpen,

    // Handlers
    handleStatusMenuClick,
    handleStatusMenuClose,
    handleAddSubtask,
    handleSubtaskUpdated,
    handleSubtaskDeleted,
    handleFileUploaded,
    handleTimeLogEdit,
    handleTimeLogDialogClose
  };
};
