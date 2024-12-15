import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Typography,
  Box,
  Grid,
  Link
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
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            mb: 1,
            p: 2
          }}
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                <Link component={RouterLink} to={`/tasks/${log.task_id}`}>
                  {log.task_name}
                </Link>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {log.description}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                User
              </Typography>
              <Typography>
                <Link component={RouterLink} to={`/users/${log.user_id}`}>
                  {log.user_name}
                </Link>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Date
              </Typography>
              <Typography>
                {format(new Date(log.created_on), 'dd/MM/yyyy HH:mm')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Time Spent
              </Typography>
              <Typography>
                {formatTime(log.spent_time)}
              </Typography>
            </Grid>
          </Grid>
        </ListItem>
      ))}
    </List>
  );
};

export default TimeLogList;