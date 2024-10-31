import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  CircularProgress 
} from '@mui/material';
import { createComment } from '../../api/comments';

const CommentForm = ({ taskId, onCommentAdded }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const newComment = await createComment(taskId, { comment });
      onCommentAdded(newComment);
      setComment('');
    } catch (error) {
      setError('Failed to add comment. Please try again.');
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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