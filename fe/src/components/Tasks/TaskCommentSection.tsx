import React from 'react';
import { Paper } from '@mui/material';
import CommentForm from '../Comments/CommentForm';
import CommentList from '../Comments/CommentList';
import { Comment, TaskCommentSectionProps } from '../../types/comment';

const TaskCommentSection: React.FC<TaskCommentSectionProps> = ({
  taskId,
  comments,
  editingComment,
  onCommentSubmit,
  onCommentUpdate,
  onCommentDelete,
  onEditStart,
  onEditEnd,
  onCommentRefresh
}) => {
  const handleCommentAdded = async (comment: Comment) => {
    // useCommentForm already created the comment via API with full data including user_name
    // The comment is already in the database, so we don't need to call onCommentSubmit
    // which would create it again and cause duplication.
    // Instead, we refresh the comments list.
    if (onCommentRefresh) {
      await onCommentRefresh();
    } else {
      // Fallback: if no refresh callback, we still need to update the list
      // But we should not call onCommentSubmit as it would create a duplicate
      // For now, do nothing - the parent should provide onCommentRefresh
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <CommentForm
        taskId={taskId}
        onCommentAdded={handleCommentAdded}
      />
      <CommentList
        comments={comments || []}
        onCommentUpdated={onCommentUpdate}
        onCommentDeleted={onCommentDelete}
        currentUserId={0} // This should come from auth context
      />
      {/* CommentList manages its own edit dialog, so we don't need the duplicate one here */}
    </Paper>
  );
};

export default TaskCommentSection;
