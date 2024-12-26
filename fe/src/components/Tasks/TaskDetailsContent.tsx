import React from 'react';
import { Grid } from '@mui/material';
import SubtaskList from './SubtaskList';
import TaskTimeLogging from './TaskTimeLogging';
import TaskCommentSection from './TaskCommentSection';
import { TaskDetailsContentProps } from '../../types/task';

const TaskDetailsContent: React.FC<TaskDetailsContentProps> = ({
  id,
  task,
  subtasks,
  timeLogs,
  comments,
  timeLogDialogOpen,
  selectedTimeLog,
  editingComment,
  onSubtaskDeleted,
  onSubtaskUpdated,
  onTimeLogSubmit,
  onTimeLogDelete,
  onTimeLogEdit,
  onTimeLogDialogClose,
  onCommentSubmit,
  onCommentUpdate,
  onCommentDelete,
  onEditStart,
  onEditEnd
}) => (
  <Grid item xs={12} md={8}>
    <SubtaskList
      subtasks={subtasks}
      parentTaskId={task.id}
      onSubtaskDeleted={onSubtaskDeleted}
      onSubtaskUpdated={onSubtaskUpdated}
    />
    <TaskTimeLogging
      taskId={Number(id)}
      timeLogs={timeLogs}
      timeLogDialogOpen={timeLogDialogOpen}
      selectedTimeLog={selectedTimeLog}
      onTimeLogSubmit={onTimeLogSubmit}
      onTimeLogDelete={onTimeLogDelete}
      onTimeLogEdit={onTimeLogEdit}
      onTimeLogDialogClose={onTimeLogDialogClose}
    />
    <TaskCommentSection
      taskId={Number(id)}
      comments={comments}
      editingComment={editingComment}
      onCommentSubmit={onCommentSubmit}
      onCommentUpdate={onCommentUpdate}
      onCommentDelete={onCommentDelete}
      onEditStart={onEditStart}
      onEditEnd={onEditEnd}
    />
  </Grid>
);

export default TaskDetailsContent;
