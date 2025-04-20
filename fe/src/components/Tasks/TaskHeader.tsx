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
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';

const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  statuses,
  statusMenuAnchor,
  onStatusMenuClick,
  onStatusMenuClose,
  onStatusChange,
  canEdit,
  canDelete,
  onDelete
}) => {
  if (!task) return null;

  // Add null check for statuses
  if (!statuses || statuses.length === 0) {
    console.warn('No statuses available');
  }

  const currentStatus = statuses?.find(status => status.id === Number(task.status_id));
  const statusName = currentStatus?.name ?? 'Unknown Status';
  const statusColor = currentStatus?.color ?? '#808080';

  return (
    <Paper
      elevation={3}
      sx={{ p: 4, mb: 4, backgroundColor: '#f8f9fa' }}
    >
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 2 }}
        >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {task.name}
          </Typography>
          <Grid container spacing={2} sx={{ color: 'text.secondary', mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <FolderIcon fontSize="small" />
                <Typography variant="body2" data-testid="project-name">
                  Project:{' '}
                  <Link
                    component={RouterLink}
                    to={`/projects/${task.project_id}`}
                    color="primary"
                  >
                    {task.project_name}
                  </Link>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <PersonIcon fontSize="small" />
                <Typography variant="body2" data-testid="holder-name">
                  Holder:{' '}
                  <Link
                    component={RouterLink}
                    to={`/users/${task.holder_id}`}
                    color="primary"
                  >
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
                  <Link
                    component={RouterLink}
                    to={`/users/${task.created_by}`}
                    color="primary"
                  >
                    {task.created_by_name}
                  </Link>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <PersonIcon fontSize="small" />
                <Typography variant="body2" data-testid="assignee-name">
                  Assignee:{' '}
                  <Link
                    component={RouterLink}
                    to={`/users/${task.assignee_id}`}
                    color="primary"
                  >
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
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                Task ID: #{task.id}
              </Typography>
            </Grid>
            {task.type_name && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Type: {task.type_name}
                </Typography>
              </Grid>
            )}
            {task.priority_name && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Priority: {task.priority_name}
                </Typography>
              </Grid>
            )}
            {task.estimated_time && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Estimated Time: {task.estimated_time} hours
                </Typography>
              </Grid>
            )}
            {task.spent_time && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Time Spent: {task.spent_time} hours
                </Typography>
              </Grid>
            )}
            {task.progress !== undefined && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Progress: {task.progress}%
                </Typography>
              </Grid>
            )}
            {task.start_date && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  Start Date: {new Date(task.start_date).toLocaleDateString()}
                </Typography>
              </Grid>
            )}
            {task.end_date && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  End Date: {new Date(task.end_date).toLocaleDateString()}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {canDelete && (
            <IconButton
              size="small"
              color="error"
              onClick={onDelete}
              sx={{ ml: 1 }}
              disabled={!canDelete}
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 3 }}>
        <Typography variant="h6">Status:</Typography>
        <Button
          onClick={canEdit ? onStatusMenuClick : undefined}
          variant="contained"
          size="small"
          disabled={!canEdit}
          sx={{
            backgroundColor: statusColor,
            color: 'white',
            px: 3,
            py: 1,
            '&:hover': {
              backgroundColor: statusColor,
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
          {statuses?.map((status) => (
            <MenuItem
              key={status.id}
              onClick={() => {
                onStatusChange(status.id);
                onStatusMenuClose();
              }}
              selected={status.id === task.status_id}
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
