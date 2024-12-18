import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { TimeLog } from '../../types/timeLog';
import { useAuth } from '../../context/AuthContext';
import PermissionButton from '../common/PermissionButton';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';

interface TimeLogListProps {
  timeLogs: TimeLog[];
  onEdit?: (timeLog: TimeLog) => void;
  onDelete?: (timeLogId: number) => void;
}

const TimeLogList: React.FC<TimeLogListProps> = ({
  timeLogs,
  onEdit,
  onDelete
}) => {
  const { currentUser } = useAuth();

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}`;
  };

  return (
    <List>
      {timeLogs && timeLogs.length > 0 ? (
        timeLogs.map((log) => (
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
                      {formatTime(log.spent_time)} hours
                    </Typography>
                    <Chip
                      label={log.activity_type_name}
                      size="small"
                      sx={{
                        backgroundColor: log.activity_type_color,
                        color: 'white'
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(log.log_date).toLocaleDateString()}
                    </Typography>
                    {log.description && (
                      <Typography variant="body2">
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
                    onClick={() => onEdit(log)}
                    tooltipText="Edit time log"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </PermissionButton>
                )}
                {onDelete && (
                  <PermissionButton
                    requiredPermission="Delete log"
                    component={IconButton}
                    onClick={() => onDelete(log.id)}
                    tooltipText="Delete time log"
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </PermissionButton>
                )}
              </Box>
            )}
          </ListItem>
        ))
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