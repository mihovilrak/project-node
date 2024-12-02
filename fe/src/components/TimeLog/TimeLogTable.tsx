import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { TimeLog, ActivityType } from '../../types/timeLog';

interface TimeLogTableProps {
  timeLogs: TimeLog[];
  activityTypes: ActivityType[];
  onEdit: (timeLog: TimeLog) => void;
  onDelete: (id: number) => void;
  currentUserId: number;
}

const TimeLogTable: React.FC<TimeLogTableProps> = ({
  timeLogs,
  activityTypes,
  onEdit,
  onDelete,
  currentUserId
}) => {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getActivityType = (id: number): ActivityType | undefined => {
    return activityTypes.find(type => type.id === id);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Activity</TableCell>
            <TableCell>Time Spent</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {timeLogs.map((log) => {
            const activityType = getActivityType(log.activity_type_id);
            return (
              <TableRow key={log.id}>
                <TableCell>{log.user_name}</TableCell>
                <TableCell>
                  {activityType && (
                    <Chip
                      label={activityType.name}
                      sx={{ backgroundColor: activityType.color, color: '#fff' }}
                    />
                  )}
                </TableCell>
                <TableCell>{formatTime(log.spent_time)}</TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell>
                  {log.user_id === currentUserId && (
                    <>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => onEdit(log)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => onDelete(log.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TimeLogTable; 