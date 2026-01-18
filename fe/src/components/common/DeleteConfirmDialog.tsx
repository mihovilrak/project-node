import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import { DeleteConfirmDialogProps } from '../../types/common';
import { useDeleteConfirm } from '../../hooks/common/useDeleteConfirm';

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  title = 'Confirm Delete',
  content = 'Are you sure you want to delete this item?',
  onClose,
  onConfirm
}) => {
  const { isDeleting, handleConfirm } = useDeleteConfirm(onConfirm, onClose);

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
        <DialogContentText id="delete-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={20} /> : null}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
