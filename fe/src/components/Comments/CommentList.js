import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Paper,
  Avatar,
  Box,
  Divider
} from '@mui/material';

const CommentList = ({ comments }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <List>
      {comments.map((comment, index) => (
        <React.Fragment key={comment.id}>
          <ListItem alignItems="flex-start" sx={{ px: 0 }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {comment.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle2" color="primary">
                  {comment.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(comment.created_on)}
                </Typography>
              </Box>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {comment.comment}
                </Typography>
              </Paper>
            </Box>
          </ListItem>
          {index < comments.length - 1 && (
            <Divider component="li" sx={{ my: 2 }} />
          )}
        </React.Fragment>
      ))}
    </List>
  );
};

export default CommentList; 