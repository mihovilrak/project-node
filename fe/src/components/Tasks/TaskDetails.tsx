import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Grid, Typography, Alert } from '@mui/material';
import TaskDetailsHeader from './TaskDetailsHeader';
import TaskDetailsContent from './TaskDetailsContent';
import TaskDetailsSidebar from './TaskDetailsSidebar';
import { useTaskCore } from '../../hooks/task/useTaskCore';
import { useTaskTimeLogs } from '../../hooks/task/useTaskTimeLogs';
import { useTaskWatchers } from '../../hooks/task/useTaskWatchers';
import { useTaskComments } from '../../hooks/task/useTaskComments';
import { useTaskDetailsHandlers } from '../../hooks/task/useTaskDetailsHandlers';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';
import { useAuth } from '../../context/AuthContext';

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission, currentUser } = useAuth();

  const {
    task,
    subtasks,
    statuses,
    loading,
    error,
    actionError,
    setActionError,
    handleStatusChange: handleStatusChangeCore,
    handleDelete,
    setSubtasks,
  } = useTaskCore(id!);

  const { timeLogs, handleTimeLogSubmit, deleteTimeLog } = useTaskTimeLogs(id!);

  const { watchers, handleAddWatcher, handleRemoveWatcher } = useTaskWatchers(
    id!,
  );

  const {
    comments,
    handleCommentSubmit,
    handleCommentUpdate,
    handleCommentDelete,
  } = useTaskComments(id!);

  const {
    state: {
      statusMenuAnchor,
      editingComment,
      timeLogDialogOpen,
      selectedTimeLog,
      watcherDialogOpen,
    },
    handleStatusMenuClick,
    handleStatusMenuClose,
    handleEditStart,
    handleTimeLogCreate,
    handleTimeLogEdit,
    handleTimeLogDialogClose,
    handleAddSubtaskClick,
    handleSubtaskUpdate,
    handleSubtaskDelete,
    handleWatcherDialogOpen,
    handleWatcherDialogClose,
  } = useTaskDetailsHandlers();

  const runWatcherAction = async (
    action: (userId: number) => Promise<void>,
    userId: number,
  ) => {
    try {
      setActionError(null);
      await action(userId);
    } catch (error: unknown) {
      setActionError(getApiErrorMessage(error, 'Failed to update watchers'));
    }
  };

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
        <Typography color="error" variant="h6">
          Error loading task details
        </Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Task not found
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {actionError && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="error" onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        </Grid>
      )}

      <TaskDetailsHeader
        task={task}
        statuses={statuses}
        statusMenuAnchor={statusMenuAnchor}
        onStatusMenuClick={handleStatusMenuClick}
        onStatusMenuClose={handleStatusMenuClose}
        onStatusChange={handleStatusChange}
        onDelete={async () => {
          try {
            setActionError(null);
            await handleDelete();
          } catch (error: unknown) {
            logger.error('Failed to delete task:', error);
            setActionError(getApiErrorMessage(error, 'Failed to delete task'));
          }
        }}
        onTimeLogClick={handleTimeLogCreate}
        onAddSubtaskClick={() => handleAddSubtaskClick(task, navigate)}
        canEdit={hasPermission('Edit tasks')}
        canDelete={hasPermission('Delete tasks')}
      />

      <TaskDetailsContent
        id={id!}
        task={task}
        subtasks={subtasks}
        timeLogs={timeLogs}
        comments={comments}
        timeLogDialogOpen={timeLogDialogOpen}
        selectedTimeLog={selectedTimeLog}
        editingComment={editingComment}
        onSubtaskDeleted={(subtaskId) =>
          subtaskId && handleSubtaskDelete(subtasks, subtaskId, setSubtasks)
        }
        onSubtaskUpdated={(subtaskId, updatedSubtask) =>
          subtaskId &&
          updatedSubtask &&
          handleSubtaskUpdate(subtasks, subtaskId, updatedSubtask, setSubtasks)
        }
        onTimeLogSubmit={async (data) => {
          if (!data) return;
          try {
            setActionError(null);
            await handleTimeLogSubmit(data, selectedTimeLog?.id);
            handleTimeLogDialogClose();
          } catch (error: unknown) {
            logger.error('Failed to submit time log:', error);
            setActionError(
              getApiErrorMessage(error, 'Failed to save the time log'),
            );
          }
        }}
        onTimeLogDelete={async (timeLogId) => {
          if (!timeLogId) return;
          try {
            setActionError(null);
            await deleteTimeLog(timeLogId);
          } catch (error: unknown) {
            logger.error('Failed to delete time log:', error);
            setActionError(
              getApiErrorMessage(error, 'Failed to delete the time log'),
            );
          }
        }}
        onTimeLogEdit={(timeLog) => timeLog && handleTimeLogEdit(timeLog)}
        onTimeLogDialogClose={handleTimeLogDialogClose}
        onCommentSubmit={async (content) => {
          if (content) await handleCommentSubmit(content);
        }}
        onCommentUpdate={async (commentId, text) => {
          await handleCommentUpdate(commentId, text);
        }}
        onCommentDelete={handleCommentDelete}
        onEditStart={handleEditStart}
        onEditEnd={() => handleEditStart(null)}
        onAddSubtaskClick={() => handleAddSubtaskClick(task, navigate)}
        onTimeLogClick={handleTimeLogCreate}
        canLogTime={hasPermission('Log time')}
      />

      <TaskDetailsSidebar
        id={id!}
        projectId={task.project_id}
        watchers={watchers || []}
        watcherDialogOpen={watcherDialogOpen}
        canManageWatchers={hasPermission('Edit tasks')}
        currentUserId={currentUser?.id}
        onAddWatcher={(userId) => runWatcherAction(handleAddWatcher, userId)}
        onRemoveWatcher={(userId) =>
          runWatcherAction(handleRemoveWatcher, userId)
        }
        onWatcherDialogClose={handleWatcherDialogClose}
        onManageWatchers={handleWatcherDialogOpen}
      />
    </Grid>
  );
};

export default TaskDetails;
