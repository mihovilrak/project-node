import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Grid } from '@mui/material';
import SubtaskList from './SubtaskList';
import WatcherList from '../Watchers/WatcherList';
import WatcherDialog from '../Watchers/WatcherDialog';
import TaskHeader from './TaskHeader';
import TaskTimeLogging from './TaskTimeLogging';
import TaskFileSection from './TaskFileSection';
import TaskCommentSection from './TaskCommentSection';
import { useTaskDetails } from '../../hooks/task/useTaskDetails';
import { useTaskTimeLogs } from '../../hooks/task/useTaskTimeLogs';
import { useTaskWatchers } from '../../hooks/task/useTaskWatchers';
import { TimeLog, TimeLogCreate } from '../../types/timeLog';
import { Comment } from '../../types/comment';
import { Task } from '../../types/task';
import { TaskFile } from '../../types/file';

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    task,
    subtasks,
    comments,
    files,
    statuses,
    loading,
    error,
    handleStatusChange,
    handleDelete,
    handleCommentUpdate,
    handleCommentDelete,
    handleFileDelete,
    setComments,
    setFiles,
    setSubtasks,
    canEdit,
    canDelete
  } = useTaskDetails(id!);

  const {
    timeLogs,
    handleTimeLogSubmit
  } = useTaskTimeLogs(id!);

  const {
    watchers,
    handleAddWatcher,
    handleRemoveWatcher
  } = useTaskWatchers(id!);

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

  // Comment Handlers
  const handleSaveComment = async (commentId: number, newText: string) => {
    await handleCommentUpdate(commentId, newText);
    setEditingComment(null);
  };

  // Subtask Handlers
  const handleAddSubtask = () => {
    if (task) {
      navigate(`/tasks/new?projectId=${task.project_id}&parentTaskId=${task.id}`);
    }
  };

  const handleSubtaskUpdated = async (subtaskId: number, updatedSubtask: Task) => {
    setSubtasks(subtasks.map(subtask =>
      subtask.id === subtaskId ? updatedSubtask : subtask
    ));
  };

  const handleSubtaskDeleted = async (subtaskId: number) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
  };

  // File Handlers
  const handleFileUploaded = (file: TaskFile) => {
    setFiles([...files, file]);
  };

  // Time Log Handlers
  const handleTimeLogSubmitWrapper = async (timeLogData: TimeLogCreate) => {
    try {
      await handleTimeLogSubmit(timeLogData);
      setTimeLogDialogOpen(false);
      setSelectedTimeLog(null);
    } catch (error) {
      console.error('Error handling time log:', error);
    }
  };

  const handleTimeLogEdit = (timeLog: TimeLog) => {
    setSelectedTimeLog(timeLog);
    setTimeLogDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!task || error) {
    return <div>Error loading task details</div>;
  }

  const handleStatusChangeWrapper = (statusId: number) => {
    const newStatus = statuses.find(s => s.id === statusId);
    if (newStatus) {
      handleStatusChange(newStatus);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TaskHeader
          task={task}
          statuses={statuses}
          statusMenuAnchor={statusMenuAnchor}
          onStatusClick={handleStatusMenuClick}
          onStatusClose={handleStatusMenuClose}
          onStatusChange={handleStatusChangeWrapper}
          onDelete={handleDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </Grid>
      <Grid item xs={12} md={8}>
        <SubtaskList
          subtasks={subtasks}
          parentTaskId={task.id}
          onSubtaskDeleted={handleSubtaskDeleted}
          onSubtaskUpdated={handleSubtaskUpdated}
        />
        <TaskTimeLogging
          taskId={Number(id)}
          timeLogs={timeLogs}
          timeLogDialogOpen={timeLogDialogOpen}
          selectedTimeLog={selectedTimeLog}
          onTimeLogSubmit={handleTimeLogSubmitWrapper}
          onTimeLogDelete={() => {}} // TODO: Implement if needed
          onTimeLogEdit={handleTimeLogEdit}
          onTimeLogDialogClose={() => setTimeLogDialogOpen(false)}
        />
        <TaskCommentSection
          taskId={Number(id)}
          comments={comments}
          editingComment={editingComment}
          onCommentSubmit={text => handleCommentUpdate(0, text)}
          onCommentUpdate={handleSaveComment}
          onCommentDelete={handleCommentDelete}
          onEditStart={setEditingComment}
          onEditEnd={() => setEditingComment(null)}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <WatcherList
          watchers={watchers}
          canManageWatchers={canEdit}
          onRemoveWatcher={handleRemoveWatcher}
          onManageWatchers={() => setWatcherDialogOpen(true)}
        />
        <TaskFileSection
          taskId={Number(id)}
          files={files}
          onFileUploaded={handleFileUploaded}
          onFileDeleted={handleFileDelete}
        />
        <WatcherDialog
          open={watcherDialogOpen}
          onClose={() => setWatcherDialogOpen(false)}
          onAddWatcher={handleAddWatcher}
          projectId={task.project_id}
          currentWatchers={watchers}
          onRemoveWatcher={handleRemoveWatcher}
        />
      </Grid>
    </Grid>
  );
};

export default TaskDetails;
