import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import * as Icons from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TaskTableProps } from '../../types/task';
import { getPriorityColor } from '../../utils/taskUtils';

const getIconComponent = (iconName?: string): React.ReactElement | undefined => {
  if (!iconName) return undefined;
  try {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent ? React.createElement(IconComponent) : undefined;
  } catch {
    return undefined;
  }
};

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  loading
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Assignee</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography variant="body2" color="text.secondary">
                  No tasks found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task?.id}>
                <TableCell>{task?.name || 'Unnamed Task'}</TableCell>
                <TableCell>
                  <Chip
                    icon={getIconComponent(task?.type_icon)}
                    label={task?.type_name || 'Unknown'}
                    size="small"
                    style={{
                      backgroundColor: task?.type_color || '#666',
                      color: '#fff'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={task?.status_name || 'Unknown'}
                    size="small"
                    color={task?.status_name === 'Done' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={task?.priority_name || 'Unknown'}
                    size="small"
                    color={getPriorityColor(task?.priority_name || '')}
                  />
                </TableCell>
                <TableCell>{task?.holder_name || 'Unassigned'}</TableCell>
                <TableCell>
                  {task?.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Task">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/tasks/${task?.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskTable;
