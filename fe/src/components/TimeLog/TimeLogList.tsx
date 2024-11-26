import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Typography,
  Box
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { TimeLog } from '../../types/timeLog';
import { useAuth } from '../../context/AuthContext';
import PermissionButton from '../common/PermissionButton';

interface TimeLogListProps {
  timeLogs: TimeLog[];
  onEdit: (timeLog: TimeLog) => void;
  onDelete: (timeLogId: number) => void;
}

const TimeLogList: React.FC<TimeLogListProps> = ({ timeLogs, onEdit, onDelete }) => {
  const { currentUser } = useAuth();

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <List>
      {timeLogs.map((log) => (
        <ListItem
          key={log.id}
          secondaryAction={
            log.user_id === currentUser?.id && (
              <Box>
                <PermissionButton
                  requiredPermission="Edit log"
                  component={IconButton}
                  onClick={() => onEdit(log)}
                  tooltipText="Edit time log"
                >
                  <EditIcon />
                </PermissionButton>
                <PermissionButton
                  requiredPermission="Delete log"
                  component={IconButton}
                  onClick={() => onDelete(log.id)}
                  tooltipText="Delete time log"
                >
                  <DeleteIcon />
                </PermissionButton>
              </Box>
            )
          }
        >
          <ListItemText
            primary={
              <Typography>
                {log.user_name} - {formatTime(log.spent_time)}
              </Typography>
            }
            secondary={log.description}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default TimeLogList; 