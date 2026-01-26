import React from 'react';
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
import { useCommentEdit } from '../../hooks/comment/useCommentEdit';

const CommentEditDialog: React.FC<CommentEditDialogProps> = ({
  open,
  comment,
  onClose,
  onSave
}) => {
  const {
    editedText,
    setEditedText,
    isSubmitting,
    error,
    handleSave,
    resetForm
  } = useCommentEdit(comment, onSave);

  React.useEffect(() => {
    if (comment?.comment) {
      setEditedText(comment.comment);
    } else {
      setEditedText('');
    }
  }, [comment, setEditedText]);

  React.useEffect(() => {
    if (!open && comment) {
      resetForm();
    }
  }, [open, comment, resetForm]);

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
