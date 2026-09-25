import React from 'react';
import { Paper } from '@mui/material';
import CommentForm from '../Comments/CommentForm';
import CommentList from '../Comments/CommentList';
import { TaskCommentSectionProps } from '../../types/comment';

const TaskCommentSection: React.FC<TaskCommentSectionProps> = ({
  taskId,
  comments,
  onCommentSubmit,
  onCommentUpdate,
  onCommentDelete,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <CommentForm onSubmit={onCommentSubmit} disabled={!taskId} />
      <CommentList
        comments={comments || []}
        onCommentUpdated={onCommentUpdate}
        onCommentDeleted={onCommentDelete}
      />
    </Paper>
  );
};

export default TaskCommentSection;
