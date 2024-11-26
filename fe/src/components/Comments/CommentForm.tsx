import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  CircularProgress 
} from '@mui/material';
import { createComment } from '../../api/comments';
import {
  CommentFormProps,
  CommentError
} from '../../types/comment';

const CommentForm: React.FC<CommentFormProps> = ({ taskId, onCommentAdded }) => {
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const newComment = await createComment(taskId, {
        content: comment.trim()
      });
      
      onCommentAdded(newComment);
      setComment('');
    } catch (err) {
      const error = err as CommentError;
      setError(error.error || 'Failed to add comment');
      console.error('Error adding comment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ mt: 2 }}
    >
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        error={!!error}
        helperText={error}
        disabled={loading}
      />
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading || !comment.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Comment'}
        </Button>
      </Box>
    </Box>
  );
};

export default CommentForm;