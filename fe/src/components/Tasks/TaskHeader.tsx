import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import { TaskHeaderProps } from '../../types/task';

const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  statuses,
  canEdit,
  statusMenuAnchor,
  onStatusMenuClick,
  onStatusMenuClose,
  onStatusChange
}) => {
  if (!task) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {task.name}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          Status:
        </Typography>
        {canEdit ? (
          <>
            <Button
              onClick={onStatusMenuClick}
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              {task.status_name}
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
                  selected={status.id === task.status_id}
                >
                  {status.name}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Chip label={task.status_name} size="small" />
        )}
      </Box>
    </Box>
  );
};

export default TaskHeader;
