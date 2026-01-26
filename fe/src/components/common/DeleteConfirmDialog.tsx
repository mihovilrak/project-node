import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { DeleteConfirmDialogProps } from '../../types/common';
import { useDeleteConfirm } from '../../hooks/common/useDeleteConfirm';

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  title = 'Confirm Delete',
  content = 'Are you sure you want to delete this item?',
  onClose,
  onConfirm,
  loading = false,
  error
}) => {
  const { isDeleting, handleConfirm } = useDeleteConfirm(onConfirm, onClose);
  const isDeletingState = loading || isDeleting;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} data-testid="delete-error">
            {error}
          </Alert>
        )}
        <DialogContentText id="delete-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeletingState}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          disabled={isDeletingState}
          startIcon={isDeletingState ? <CircularProgress size={20} /> : null}
        >
          {isDeletingState ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
