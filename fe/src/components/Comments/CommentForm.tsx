import React from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  CircularProgress 
} from '@mui/material';
import { useCommentForm } from '../../hooks/comment/useCommentForm';
import { CommentFormProps } from '../../types/comment';

const CommentForm: React.FC<CommentFormProps> = ({ taskId, onCommentAdded }) => {
  const {
    comment,
    setComment,
    loading,
    error,
    handleSubmit
  } = useCommentForm(taskId, onCommentAdded);

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
      <Box
        sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}
      >
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
