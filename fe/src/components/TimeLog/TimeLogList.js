import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Chip,
  Paper
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { formatDistanceStrict } from 'date-fns';

const TimeLogList = ({ timeLogs, onEdit, onDelete }) => {
  const getActivityTypeColor = (type) => {
    const colors = {
      development: 'primary',
      testing: 'secondary',
      documentation: 'info',
      meeting: 'warning',
      review: 'success',
      bug_fixing: 'error',
      planning: 'default',
      other: 'default'
    };
    return colors[type] || 'default';
  };

  const calculateDuration = (start, end) => {
    return formatDistanceStrict(new Date(start), new Date(end));
  };

  if (!timeLogs.length) {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        No time logs recorded yet
      </Typography>
    );
  }

  return (
    <List>
      {timeLogs.map((log) => (
        <Paper 
          key={log.id} 
          variant="outlined"
          sx={{ mb: 1 }}
        >
          <ListItem
            secondaryAction={
              <Box>
                <IconButton 
                  edge="end" 
                  aria-label="edit"
                  onClick={() => onEdit(log)}
                  size="small"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => onDelete(log.id)}
                  size="small"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={log.activity_type}
                    size="small"
                    color={getActivityTypeColor(log.activity_type)}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {calculateDuration(log.start_time, log.end_time)}
                  </Typography>
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {new Date(log.start_time).toLocaleString()} - {new Date(log.end_time).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    {log.description}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        </Paper>
      ))}
    </List>
  );
};

export default TimeLogList; 