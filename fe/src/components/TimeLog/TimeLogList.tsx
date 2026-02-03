import React from 'react';
import {
  Link,
  List,
  ListItem,
  IconButton,
  Box,
  Typography,
  Chip
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
                flexDirection: 'column',
                alignItems: 'stretch',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                <Box
                  sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    display: 'grid',
                    gridTemplateColumns: '100px 130px 1fr',
                    columnGap: 1.5,
                    rowGap: 0.25,
                    alignContent: 'start'
                  }}
                >
                  <Typography variant="body1" sx={{ gridColumn: 1 }}>
                    {formatTime(log?.spent_time || 0)} h
                  </Typography>
                  <Box sx={{ gridColumn: 2 }}>
                    <Chip
                      label={log?.activity_type_name || 'Unknown'}
                      size="small"
                      sx={{
                        backgroundColor: log?.activity_type_color || '#666',
                        color: 'white'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ gridColumn: 3, minWidth: 0 }}>
                    {log?.task_id ? (
                      <Link component={RouterLink} to={`/tasks/${log.task_id}`}>
                        {log?.task_name || 'Unknown Task'}
                      </Link>
                    ) : (
                      <span>{log?.task_name || 'Unknown Task'}</span>
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ gridColumn: 1 }}>
                    {log?.log_date ? new Date(log.log_date).toLocaleDateString() : '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ gridColumn: 2 }}>
                    {log?.user_id ? (
                      <Link component={RouterLink} to={`/users/${log.user_id}`}>
                        {log?.user || 'Unknown User'}
                      </Link>
                    ) : (
                      <span>{log?.user || 'Unknown User'}</span>
                    )}
                  </Typography>
                  {log?.description && (
                    <Typography variant="body2" sx={{ gridColumn: '1 / -1', mt: 0.5 }}>
                      {log.description}
                    </Typography>
                  )}
                </Box>
                {(onEdit || onDelete) && (
                  <Box sx={{ flexShrink: 0 }}>
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
              </Box>
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
