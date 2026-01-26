import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Grid, Typography, Alert } from '@mui/material';
import TaskDetailsHeader from './TaskDetailsHeader';
import TaskDetailsContent from './TaskDetailsContent';
import TaskDetailsSidebar from './TaskDetailsSidebar';
import { TaskFile } from '../../types/file';
import { useTaskCore } from '../../hooks/task/useTaskCore';
import { useTaskTimeLogs } from '../../hooks/task/useTaskTimeLogs';
import { useTaskWatchers } from '../../hooks/task/useTaskWatchers';
import { useTaskComments } from '../../hooks/task/useTaskComments';
import { useTaskFiles } from '../../hooks/task/useTaskFiles';
import { useTaskDetailsHandlers } from '../../hooks/task/useTaskDetailsHandlers';
import { TimeLog } from '../../types/timeLog';

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    task,
    subtasks,
    statuses,
    loading,
    error,
    handleStatusChange: handleStatusChangeCore,
    handleDelete,
    setSubtasks,
  } = useTaskCore(id!);

  const {
    timeLogs,
    handleTimeLogSubmit,
    deleteTimeLog,
    fetchTimeLogs
  } = useTaskTimeLogs(id!);

  useEffect(() => {
    if (id) {
      fetchTimeLogs();
    }
  }, [id, fetchTimeLogs]);

  const {
    watchers,
    handleAddWatcher,
    handleRemoveWatcher
  } = useTaskWatchers(id!);

  const {
    files,
    handleFileUpload,
    handleFileDelete,
    refreshFiles
  } = useTaskFiles(id!);

  const {
    comments,
    handleCommentSubmit,
    handleCommentUpdate,
    handleCommentDelete,
    fetchComments
  } = useTaskComments(id!);

  const {
    state: {
      statusMenuAnchor,
      editingComment,
      timeLogDialogOpen,
      selectedTimeLog,
      watcherDialogOpen
    },
    handleStatusMenuClick,
    handleStatusMenuClose,
    handleStatusChange: handleStatusChangeWrapper,
    handleSaveComment,
    handleEditStart,
    handleTimeLogSubmit: handleTimeLogSubmitWrapper,
    handleTimeLogEdit,
    handleTimeLogDialogClose,
    handleAddSubtaskClick,
    handleSubtaskUpdate,
    handleSubtaskDelete,
    handleWatcherDialogOpen,
    handleWatcherDialogClose
  } = useTaskDetailsHandlers();

  const [state, setState] = useState<{
    statusMenuAnchor: null;
    editingComment: null;
    timeLogDialogOpen: boolean;
    selectedTimeLog: TimeLog | null;
    watcherDialogOpen: boolean;
  }>({
    statusMenuAnchor: null,
    editingComment: null,
    timeLogDialogOpen: false,
    selectedTimeLog: null,
    watcherDialogOpen: false
  });

  const handleStatusChange = async (statusId: number) => {
    await handleStatusChangeCore(statusId);
    handleStatusMenuClose();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">Error loading task details</Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">Task not found</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <TaskDetailsHeader
        task={task}
        statuses={statuses || []}
        statusMenuAnchor={statusMenuAnchor}
        onStatusMenuClick={handleStatusMenuClick}
        onStatusMenuClose={handleStatusMenuClose}
        onStatusChange={handleStatusChange}
        onDelete={async () => {
          try {
            await handleDelete();
          } catch (error: any) {
            console.error('Failed to delete task:', error);
          }
        }}
        onTimeLogClick={() => setState(prev => ({
          ...prev,
          timeLogDialogOpen: true,
          selectedTimeLog: null
        }))}
        onAddSubtaskClick={() => task && handleAddSubtaskClick(task, navigate)}
        canEdit={true}
        canDelete={true}
      />

      <TaskDetailsContent
        id={id!}
        task={task}
        subtasks={subtasks}
        timeLogs={timeLogs}
        comments={comments}
        timeLogDialogOpen={state.timeLogDialogOpen}
        selectedTimeLog={state.selectedTimeLog}
        editingComment={editingComment}
        onSubtaskDeleted={(subtaskId) => subtaskId && handleSubtaskDelete(subtasks, subtaskId, setSubtasks)}
        onSubtaskUpdated={(subtaskId, updatedSubtask) => subtaskId && updatedSubtask && handleSubtaskUpdate(subtasks, subtaskId, updatedSubtask, setSubtasks)}
        onTimeLogSubmit={async (data) => {
          if (!data) return;
          try {
            // Pass the timeLogId if we're editing
            const timeLogId = state.selectedTimeLog?.id;
            await handleTimeLogSubmit(data, timeLogId);
            setState({
              ...state,
              timeLogDialogOpen: false,
              selectedTimeLog: null
            });
          } catch (error: any) {
            console.error('Failed to submit time log:', error);
            // Keep dialog open on error
          }
        }}
        onTimeLogDelete={async (timeLogId) => {
          if (timeLogId) {
            await deleteTimeLog(timeLogId);
          }
        }}
        onTimeLogEdit={(timeLog) => {
          if (timeLog) {
            setState({
              ...state,
              timeLogDialogOpen: true,
              selectedTimeLog: timeLog
            });
          }
        }}
        onTimeLogDialogClose={() => setState({
          ...state,
          timeLogDialogOpen: false,
          selectedTimeLog: null
        })}
        onCommentSubmit={async (content) => {
          // This should not be called anymore since useCommentForm handles creation
          // But keeping it for backward compatibility
          if (content) {
            const comment = await handleCommentSubmit(content);
            return;
          }
        }}
        onCommentRefresh={fetchComments}
        onCommentUpdate={async (commentId, text) => {
          const comment = await handleCommentUpdate(commentId, text);
          return;
        }}
        onCommentDelete={handleCommentDelete}
        onEditStart={(commentId) => handleEditStart(commentId)}
        onEditEnd={() => handleEditStart(null)}
        onAddSubtaskClick={() => handleAddSubtaskClick(task, navigate)}
        onTimeLogClick={() => setState(prev => ({
          ...prev,
          timeLogDialogOpen: true,
          selectedTimeLog: null
        }))}
      />

      <TaskDetailsSidebar
        id={id!}
        projectId={task?.project_id ?? null}
        files={files || []}
        watchers={watchers || []}
        watcherDialogOpen={watcherDialogOpen}
        onFileUploaded={async () => {
          await refreshFiles();
        }}
        onFileDeleted={handleFileDelete}
        onAddWatcher={handleAddWatcher}
        onRemoveWatcher={handleRemoveWatcher}
        onWatcherDialogClose={handleWatcherDialogClose}
        onManageWatchers={handleWatcherDialogOpen}
      />
    </Grid>
  );
};

export default TaskDetails;
