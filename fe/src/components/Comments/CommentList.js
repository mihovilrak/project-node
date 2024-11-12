import React, { useState } from 'react';
import { 
  List, 
  ListItem,
  Typography, 
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Paper,
  Divider
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CommentEditDialog from './CommentEditDialog';

const CommentList = ({ comments, onCommentUpdated, onCommentDeleted, currentUserId }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleMenuClick = (event, comment) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedComment(null);
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedComment(null);
  };

  const handleEditSave = async (commentId, newText) => {
    await onCommentUpdated(commentId, newText);
    setEditDialogOpen(false);
    setSelectedComment(null);
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await onCommentDeleted(selectedComment.id);
      handleMenuClose();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <List>
        {comments.map((comment) => (
          <ListItem
            key={comment.id}
            alignItems="flex-start"
            sx={{ px: 0 }}
          >
            <Avatar sx={{ mr: 2 }}>
              {comment.user_name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">
                  {comment.user_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(comment.created_on)}
                  </Typography>
                  {comment.user_id === currentUserId && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, comment)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {comment.comment}
                </Typography>
              </Paper>
            </Box>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
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