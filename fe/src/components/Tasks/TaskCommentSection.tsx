import React from 'react';
import { Paper } from '@mui/material';
import CommentForm from '../Comments/CommentForm';
import CommentList from '../Comments/CommentList';
import CommentEditDialog from '../Comments/CommentEditDialog';
import { Comment, TaskCommentSectionProps } from '../../types/comment';

const TaskCommentSection: React.FC<TaskCommentSectionProps> = ({
  taskId,
  comments,
  editingComment,
  onCommentSubmit,
  onCommentUpdate,
  onCommentDelete,
  onEditStart,
  onEditEnd
}) => {
  const handleCommentAdded = (comment: Comment) => {
    onCommentSubmit(comment.comment);
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <CommentForm 
        taskId={taskId}
        onCommentAdded={handleCommentAdded}
      />
      <CommentList
        comments={comments}
        onCommentUpdated={onCommentUpdate}
        onCommentDeleted={onCommentDelete}
        currentUserId={0} // This should come from auth context
      />
      {editingComment && (
        <CommentEditDialog
          comment={editingComment}
          open={!!editingComment}
          onClose={onEditEnd}
          onSave={onCommentUpdate}
        />
      )}
    </Paper>
  );
};

export default TaskCommentSection;
