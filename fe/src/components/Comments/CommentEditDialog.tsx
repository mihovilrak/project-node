import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Box
} from '@mui/material';
import { CommentEditDialogProps } from '../../types/comment';

const CommentEditDialog: React.FC<CommentEditDialogProps> = ({
  open,
  comment,
  onClose,
  onSave
}) => {
  const [editedText, setEditedText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (comment) {
      setEditedText(comment.comment);
    }
  }, [comment]);

  const handleClose = (): void => {
    setEditedText('');
    setError('');
    onClose();
  };

  const handleSave = async (): Promise<void> => {
    if (!comment) return;
    
    try {
      setIsSubmitting(true);
      await onSave(comment.id, editedText);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleSave();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edit Comment</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          error={!!error}
          helperText={error}
          disabled={isSubmitting}
          sx={{ mt: 2 }}
          onKeyDown={handleKeyPress}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Box sx={{ position: 'relative' }}>
          <Button
            onClick={handleSave}
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
