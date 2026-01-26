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
import * as Icons from '@mui/icons-material';
import { TaskHeaderProps } from '../../types/task';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';

const getIconComponent = (iconName?: string, color?: string): React.ReactElement | undefined => {
  if (!iconName) return undefined;
  try {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent ? React.createElement(IconComponent, { sx: { color } }) : undefined;
  } catch {
    return undefined;
  }
};

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
      sx={{ p: 4, mb: 4, bgcolor: 'background.default' }}
    >
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 2 }}
        >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {task?.name || 'Unnamed Task'}
          </Typography>
          <Grid container spacing={2} sx={{ color: 'text.secondary', mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <FolderIcon fontSize="small" />
                <Typography variant="body2" data-testid="project-name">
                  Project:{' '}
                  {task?.project_id ? (
                    <Link
                      component={RouterLink}
                      to={`/projects/${task.project_id}`}
                      color="primary"
                    >
                      {task?.project_name || 'Unknown'}
                    </Link>
                  ) : (
                    'No project'
                  )}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <PersonIcon fontSize="small" />
                <Typography variant="body2" data-testid="holder-name">
                  Holder:{' '}
                  {task?.holder_id ? (
                    <Link
                      component={RouterLink}
                      to={`/users/${task.holder_id}`}
                      color="primary"
                    >
                      {task?.holder_name || 'Unknown'}
                    </Link>
                  ) : (
                    'Not assigned'
                  )}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <PersonIcon fontSize="small" />
                <Typography variant="body2">
                  Created by:{' '}
                  {task?.created_by ? (
                    <Link
                      component={RouterLink}
                      to={`/users/${task.created_by}`}
                      color="primary"
                    >
                      {task?.created_by_name || 'Unknown'}
                    </Link>
                  ) : (
                    'Unknown'
                  )}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <PersonIcon fontSize="small" />
                <Typography variant="body2" data-testid="assignee-name">
                  Assignee:{' '}
                  {task?.assignee_id ? (
                    <Link
                      component={RouterLink}
                      to={`/users/${task.assignee_id}`}
                      color="primary"
                    >
                      {task?.assignee_name || 'Unknown'}
                    </Link>
                  ) : (
                    'Unassigned'
                  )}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2">
                Created: {task?.created_on ? new Date(task.created_on).toLocaleDateString() : 'Unknown'}
              </Typography>
            </Grid>
            {task?.due_date && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </Typography>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2">
                Task ID: #{task?.id || 'Unknown'}
              </Typography>
            </Grid>
            {task?.type_name && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {task?.type_icon && getIconComponent(task.type_icon, task?.type_color)}
                  <Typography variant="body2">
                    Type: <span style={{ color: task?.type_color || '#666' }}>{task.type_name}</span>
                  </Typography>
                </Box>
              </Grid>
            )}
            {task?.priority_name && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  Priority: {task.priority_name}
                </Typography>
              </Grid>
            )}
            {task?.estimated_time !== undefined && task?.estimated_time !== null && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  Estimated Time: {task.estimated_time} hours
                </Typography>
              </Grid>
            )}
            {task?.spent_time !== undefined && task?.spent_time !== null && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  Time Spent: {task.spent_time} hours
                </Typography>
              </Grid>
            )}
            {task?.progress !== undefined && task?.progress !== null && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  Progress: {task.progress}%
                </Typography>
              </Grid>
            )}
            {task?.start_date && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  Start Date: {new Date(task.start_date).toLocaleDateString()}
                </Typography>
              </Grid>
            )}
            {task?.end_date && (
              <Grid size={{ xs: 12, sm: 6 }}>
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
