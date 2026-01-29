import { useState } from 'react';
import { Comment } from '../../types/comment';

export const useCommentMenu = (onCommentUpdated: (id: number, text: string) => Promise<void>, onCommentDeleted: (id: number) => Promise<void>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, comment: Comment): void => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleEditClick = (): void => {
    setAnchorEl(null); // Close the menu only; keep selectedComment for the dialog
    setEditDialogOpen(true);
  };

  const handleEditClose = (): void => {
    setEditDialogOpen(false);
    setSelectedComment(null);
  };

  const handleEditSave = async (commentId: number, newText: string): Promise<void> => {
    try {
      await onCommentUpdated(commentId, newText);
      handleEditClose();
    } catch (error) {
      console.error('Failed to save comment:', error);
      // Don't close the dialog on error so user can retry
      throw error;
    }
  };

  const handleDeleteClick = async (): Promise<void> => {
    if (selectedComment) {
      await onCommentDeleted(selectedComment.id);
      handleMenuClose();
    }
  };

  return {
    anchorEl,
    selectedComment,
    editDialogOpen,
    handleMenuOpen,
    handleMenuClose,
    handleEditClick,
    handleEditClose,
    handleEditSave,
    handleDeleteClick
  };
};
