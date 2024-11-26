import React, { useState } from 'react';
import {
  List,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Box,
  Paper
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CommentEditDialog from './CommentEditDialog';
import { Comment, CommentListProps } from '../../types/comment';

const CommentList: React.FC<CommentListProps> = ({
  comments,
  onCommentUpdated,
  onCommentDeleted
}) => {
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
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditClose = (): void => {
    setEditDialogOpen(false);
    setSelectedComment(null);
  };

  const handleEditSave = async (commentId: number, newText: string): Promise<void> => {
    await onCommentUpdated(commentId, newText);
    handleEditClose();
  };

  const handleDeleteClick = async (): Promise<void> => {
    if (selectedComment) {
      await onCommentDeleted(selectedComment.id);
      handleMenuClose();
    }
  };

  return (
    <>
      <List>
        {comments.map((comment) => (
          <Paper 
            key={comment.id} 
            elevation={0} 
            sx={{ mb: 2, p: 2, backgroundColor: 'background.default' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <Avatar 
                src={comment.user_avatar || undefined}
                alt={comment.user_name}
                sx={{ width: 32, height: 32, mr: 2 }}
              />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2">
                    {comment.user_name}
                  </Typography>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.created_on).toLocaleString()}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, comment)}
                      sx={{ ml: 1 }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {comment.comment}
                </Typography>
              </Box>
            </Box>
            {comment.updated_on && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Edited {new Date(comment.updated_on).toLocaleString()}
              </Typography>
            )}
          </Paper>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <CommentEditDialog
        open={editDialogOpen}
        comment={selectedComment}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </>
  );
};

export default CommentList;