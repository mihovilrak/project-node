import React from 'react';
import {
  Link,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Chip,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { TimeLogListProps } from '../../types/timeLog';
import PermissionButton from '../common/PermissionButton';

const TimeLogList: React.FC<TimeLogListProps> = ({
  timeLogs,
  onEdit,
  onDelete
}) => {

  const formatTime = (hours: number | string): string => {
    const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;

    if (typeof numHours !== 'number' || isNaN(numHours)) {
      return '0:00';
    }
    const wholeHours = Math.floor(numHours);
    const minutes = Math.round((numHours - wholeHours) * 60);
    const formatted = `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
    return formatted;
  };

  return (
    <List>
      {timeLogs && timeLogs.length > 0 ? (
        timeLogs.map((log) => {
          if (!log?.id) return null;
          return (
            <ListItem
              key={log.id}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                mb: 1,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>
                        {formatTime(log?.spent_time || 0)} hours
                      </Typography>
                      <Chip
                        label={log?.activity_type_name || 'Unknown'}
                        size="small"
                        sx={{
                          backgroundColor: log?.activity_type_color || '#666',
                          color: 'white'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {log?.log_date ? new Date(log.log_date).toLocaleDateString() : 'Unknown date'}
                      </Typography>
                      <Typography variant="body1">
                        By: {log?.user_id ? (
                          <Link component={RouterLink} to={`/users/${log.user_id}`}>
                            {log?.user || 'Unknown User'}
                          </Link>
                        ) : (
                          <span>{log?.user || 'Unknown User'}</span>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Task: {log?.task_id ? (
                          <Link component={RouterLink} to={`/tasks/${log.task_id}`}>
                            {log?.task_name || 'Unknown Task'}
                          </Link>
                        ) : (
                          <span>{log?.task_name || 'Unknown Task'}</span>
                        )}
                      </Typography>
                      {log?.description && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {log.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </Box>
              {(onEdit || onDelete) && (
                <Box>
                  {onEdit && (
                    <PermissionButton
                      requiredPermission="Edit log"
                      component={IconButton}
                      onClick={() => log && onEdit(log)}
                      tooltipText="Edit time log"
                      size="small"
                      sx={{ mr: 1 }}
                      disabled={!log}
                    >
                      <EditIcon />
                    </PermissionButton>
                  )}
                  {onDelete && (
                    <PermissionButton
                      requiredPermission="Delete log"
                      component={IconButton}
                      onClick={() => log?.id && onDelete(log.id)}
                      tooltipText="Delete time log"
                      size="small"
                      color="error"
                      disabled={!log?.id}
                    >
                      <DeleteIcon />
                    </PermissionButton>
                  )}
                </Box>
              )}
            </ListItem>
          );
        })
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mt: 2 }}
        >
          No time logs found
        </Typography>
      )}
    </List>
  );
};

export default TimeLogList;
