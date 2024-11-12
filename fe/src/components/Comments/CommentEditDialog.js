import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box
} from '@mui/material';

const CommentEditDialog = ({ open, comment, onClose, onSave }) => {
  const [editedText, setEditedText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (comment) {
      setEditedText(comment.comment || '');
    }
  }, [comment]);

  const handleClose = () => {
    setEditedText('');
    setError('');
    onClose();
  };

  const handleSave = async () => {
    if (!editedText.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave(comment.id, editedText.trim());
      handleClose();
    } catch (error) {
      setError('Failed to save comment. Please try again.');
      console.error('Error saving comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleSave();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { minHeight: '200px' }
      }}
    >
      <DialogTitle>Edit Comment</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          multiline
          rows={4}
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onKeyPress={handleKeyPress}
          error={Boolean(error)}
          helperText={error || 'Press Ctrl+Enter to save'}
          disabled={isSubmitting}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Box sx={{ position: 'relative' }}>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={isSubmitting || !editedText.trim()}
          >
            Save
          </Button>
          {isSubmitting && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px'
              }}
            />
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CommentEditDialog; 