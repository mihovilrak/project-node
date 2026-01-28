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
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { deleteTask } from '../../api/tasks';
import { SubtaskListProps } from '../../types/task';
import { getPriorityColor } from '../../utils/taskUtils';

const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  onSubtaskDeleted,
  onSubtaskUpdated
}) => {
  const navigate = useNavigate();

  const handleDelete = async (subtaskId: number): Promise<void> => {
    try {
      await deleteTask(subtaskId);
      onSubtaskDeleted(subtaskId);
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    }
  };

  if (subtasks.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
        No subtasks found
      </Typography>
    );
  }

  return (
    <List>
      {subtasks.map((subtask) => (
        <Paper
          key={subtask.id}
          variant="outlined"
          sx={{ mb: 1, backgroundColor: subtask.status_name === 'Done' ? 'action.hover' : 'inherit' }}
        >
          <ListItem
            secondaryAction={
              <Box>
                <Tooltip title="Edit">
                  <IconButton
                    edge="end"
                    onClick={() => navigate(`/tasks/${subtask.id}/edit`)}
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
                      textDecoration: subtask.status_name === 'Done' ? 'line-through' : 'none',
                      color: subtask.status_name === 'Done' ? 'text.secondary' : 'text.primary',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/tasks/${subtask.id}`)}
                  >
                    {subtask.name}
                  </Typography>
                  <Chip
                    label={subtask.priority_name}
                    size="small"
                    color={getPriorityColor(subtask.priority_name)}
                  />
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {subtask.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Due: {subtask.due_date ? new Date(subtask.due_date).toLocaleDateString() : '-'}
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

export default SubtaskList;
