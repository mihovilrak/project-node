import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as TodoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { deleteTask, changeTaskStatus } from '../../api/tasks';

const SubtaskList = ({ subtasks, parentTaskId, onSubtaskUpdated, onSubtaskDeleted }) => {
  const navigate = useNavigate();

  const handleStatusToggle = async (subtask) => {
    try {
      const newStatus = subtask.status === 'Done' ? 'In Progress' : 'Done';
      await changeTaskStatus(subtask.id, newStatus);
      onSubtaskUpdated(subtask.id, { ...subtask, status: newStatus });
    } catch (error) {
      console.error('Failed to update subtask status:', error);
    }
  };

  const handleDelete = async (subtaskId) => {
    if (window.confirm('Are you sure you want to delete this subtask?')) {
      try {
        await deleteTask(subtaskId);
        onSubtaskDeleted(subtaskId);
      } catch (error) {
        console.error('Failed to delete subtask:', error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const calculateProgress = () => {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(task => task.status === 'Done').length;
    return (completed / subtasks.length) * 100;
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Progress ({Math.round(calculateProgress())}%)
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={calculateProgress()} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <List>
        {subtasks.map((subtask) => (
          <Paper 
            key={subtask.id} 
            variant="outlined" 
            sx={{ mb: 1, backgroundColor: subtask.status === 'Done' ? 'action.hover' : 'inherit' }}
          >
            <ListItem
              secondaryAction={
                <Box>
                  <Tooltip title="Toggle Status">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleStatusToggle(subtask)}
                      color={subtask.status === 'Done' ? 'success' : 'default'}
                    >
                      {subtask.status === 'Done' ? <DoneIcon /> : <TodoIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      edge="end" 
                      onClick={() => navigate(`/tasks/${subtask.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDelete(subtask.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        textDecoration: subtask.status === 'Done' ? 'line-through' : 'none',
                        color: subtask.status === 'Done' ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {subtask.name}
                    </Typography>
                    <Chip 
                      label={subtask.priority} 
                      size="small" 
                      color={getPriorityColor(subtask.priority)}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {subtask.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Due: {new Date(subtask.due_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default SubtaskList; 