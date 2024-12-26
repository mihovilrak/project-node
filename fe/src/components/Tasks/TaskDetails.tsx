import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Grid } from '@mui/material';
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

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    task,
    subtasks,
    statuses,
    loading,
    error,
    handleStatusChange,
    handleDelete,
    setSubtasks,
  } = useTaskCore(id!);

  const {
    timeLogs,
    handleTimeLogSubmit,
    deleteTimeLog
  } = useTaskTimeLogs(id!);

  const {
    watchers,
    handleAddWatcher,
    handleRemoveWatcher
  } = useTaskWatchers(id!);

  const {
    files,
    handleFileUpload,
    handleFileDelete
  } = useTaskFiles(id!);

  const {
    comments,
    handleCommentSubmit,
    handleCommentUpdate,
    handleCommentDelete
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
    handleSubtaskUpdate,
    handleSubtaskDelete,
    handleWatcherDialogOpen,
    handleWatcherDialogClose
  } = useTaskDetailsHandlers();

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

  return (
    <Grid container spacing={2}>
      <TaskDetailsHeader
        task={task}
        statuses={statuses}
        statusMenuAnchor={statusMenuAnchor}
        onStatusMenuClick={handleStatusMenuClick}
        onStatusMenuClose={handleStatusMenuClose}
        onStatusChange={(statusId) => handleStatusChangeWrapper(statusId, statuses, handleStatusChange)}
        onDelete={handleDelete}
        canEdit={true}
        canDelete={true}
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
        onSubtaskDeleted={(subtaskId) => handleSubtaskDelete(subtasks, subtaskId, setSubtasks)}
        onSubtaskUpdated={(subtaskId, updatedSubtask) => handleSubtaskUpdate(subtasks, subtaskId, updatedSubtask, setSubtasks)}
        onTimeLogSubmit={async (data) => {
          await handleTimeLogSubmit(data);
        }}
        onTimeLogDelete={deleteTimeLog}
        onTimeLogEdit={handleTimeLogEdit}
        onTimeLogDialogClose={handleTimeLogDialogClose}
        onCommentSubmit={async (content) => {
          await handleCommentSubmit(content);
        }}
        onCommentUpdate={async (commentId, text) => {
          await handleCommentUpdate(commentId, text);
        }}
        onCommentDelete={handleCommentDelete}
        onEditStart={handleEditStart}
        onEditEnd={() => handleEditStart(null)}
      />
      
      <TaskDetailsSidebar
        id={id!}
        projectId={task.project_id}
        files={files}
        watchers={watchers}
        watcherDialogOpen={watcherDialogOpen}
        onFileUploaded={(file: TaskFile) => {
          handleFileUpload(file as unknown as File);
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
