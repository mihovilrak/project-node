import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Paper,
  Divider,
  Link,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { TaskHeaderProps } from '../../types/task';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddTaskIcon from '@mui/icons-material/AddTask';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';

const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  statuses,
  statusMenuAnchor,
  onStatusMenuClick,
  onStatusMenuClose,
  onStatusChange,
  onDelete,
  onTimeLogClick,
  onAddSubtaskClick,
  canEdit,
  canDelete
}) => {
  if (!task) return null;

  const currentStatus = statuses?.find(s => s.id === task.status_id);
  const statusName = currentStatus?.name || 'Unknown Status';

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {task.name}
          </Typography>
          <Grid container spacing={2} sx={{ color: 'text.secondary', mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <FolderIcon fontSize="small" />
                <Typography variant="body2">
                  Project:{' '}
                  <Link component={RouterLink} to={`/projects/${task.project_id}`} color="primary">
                    {task.project_name}
                  </Link>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <PersonIcon fontSize="small" />
                <Typography variant="body2">
                  Holder:{' '}
                  <Link component={RouterLink} to={`/users/${task.holder_id}`} color="primary">
                    {task.holder_name}
                  </Link>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <PersonIcon fontSize="small" />
                <Typography variant="body2">
                  Created by:{' '}
                  <Link component={RouterLink} to={`/users/${task.created_by}`} color="primary">
                    {task.created_by_name}
                  </Link>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <PersonIcon fontSize="small" />
                <Typography variant="body2">
                  Assignee:{' '}
                  <Link component={RouterLink} to={`/users/${task.assignee_id}`} color="primary">
                    {task.assignee_name}
                  </Link>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                Created: {new Date(task.created_on).toLocaleDateString()}
              </Typography>
            </Grid>
            {task.due_date && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {canDelete && (
            <IconButton 
              onClick={onDelete}
              size="small"
              color="error"
              sx={{ ml: 'auto' }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1">Status:</Typography>
        <Button
          onClick={onStatusMenuClick}
          variant="contained"
          size="small"
          sx={{
            backgroundColor: currentStatus?.color || 'grey.500',
            '&:hover': {
              backgroundColor: currentStatus?.color || 'grey.600',
              opacity: 0.9
            }
          }}
        >
          {statusName}
        </Button>
        <Menu
          anchorEl={statusMenuAnchor}
          open={Boolean(statusMenuAnchor)}
          onClose={onStatusMenuClose}
        >
          {statuses.map((status) => (
            <MenuItem
              key={status.id}
              onClick={() => {
                onStatusChange(status.id);
                onStatusMenuClose();
              }}
              sx={{
                backgroundColor: status.id === task.status_id ? status.color : 'inherit',
                '&:hover': {
                  backgroundColor: status.color,
                  opacity: 0.9
                }
              }}
            >
              {status.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Paper>
  );
};

export default TaskHeader;
