import React, { useState, useEffect } from 'react';
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
import { deleteTask, changeTaskStatus, getTaskStatuses } from '../../api/tasks';

const SubtaskList = ({ subtasks, parentTaskId, onSubtaskUpdated, onSubtaskDeleted }) => {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statusData = await getTaskStatuses();
        setStatuses(statusData);
      } catch (error) {
        console.error('Failed to fetch statuses:', error);
      }
    };
    fetchStatuses();
  }, []);

  const handleStatusToggle = async (subtask) => {
    try {
      const doneStatus = statuses.find(s => s.status === 'Done');
      const inProgressStatus = statuses.find(s => s.status === 'In Progress');
      
      const newStatusId = subtask.status_id === doneStatus?.id 
        ? inProgressStatus?.id 
        : doneStatus?.id;

      await changeTaskStatus(subtask.task_id, { statusId: newStatusId });
      onSubtaskUpdated(subtask.task_id, { 
        ...subtask, 
        status_id: newStatusId,
        status: newStatusId === doneStatus?.id ? 'Done' : 'In Progress'
      });
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
      case 'very high/must': return 'error';
      case 'high/should': return 'warning';
      case 'normal/could': return 'info';
      case 'low/would': return 'success';
      default: return 'default';
    }
  };

  const calculateProgress = () => {
    if (subtasks.length === 0) return 0;
    const doneStatus = statuses.find(s => s.status === 'Done');
    const completed = subtasks.filter(task => task.status_id === doneStatus?.id).length;
    return (completed / subtasks.length) * 100;
  };

  const getTaskStatus = (statusId) => {
    const status = statuses.find(s => s.id === statusId);
    return {
      isDone: status?.status === 'Done',
      isInProgress: status?.status === 'In Progress',
      isDeleted: status?.status === 'Deleted',
      isCancelled: status?.status === 'Cancelled'
    };
  };

  const isDone = (subtask) => getTaskStatus(subtask.status_id).isDone;

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
            key={subtask.task_id} 
            variant="outlined" 
            sx={{ mb: 1, backgroundColor: isDone(subtask) ? 'action.hover' : 'inherit' }}
          >
            <ListItem
              secondaryAction={
                <Box>
                  <Tooltip title="Toggle Status">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleStatusToggle(subtask)}
                      color={isDone(subtask) ? 'success' : 'default'}
                    >
                      {isDone(subtask) ? <DoneIcon /> : <TodoIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      edge="end" 
                      onClick={() => navigate(`/tasks/${subtask.task_id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDelete(subtask.task_id)}
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
                        textDecoration: isDone(subtask) ? 'line-through' : 'none',
                        color: isDone(subtask) ? 'text.secondary' : 'text.primary'
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