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
  Box
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TaskTable = ({ tasks, loading, priorities, statuses, users, taskTypes }) => {
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
          {tasks.map((task) => (
            <TableRow key={task.task_id}>
              <TableCell>{task.name}</TableCell>
              <TableCell>
                <Chip 
                  label={task.type_name}
                  size="small"
                  style={{ 
                    backgroundColor: task.type_color,
                    color: '#fff'
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={task.status}
                  size="small"
                  color={task.status === 'Done' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={task.priority}
                  size="small"
                  color={getPriorityColor(task.priority)}
                />
              </TableCell>
              <TableCell>{task.assignee}</TableCell>
              <TableCell>
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell>
                <Tooltip title="Edit Task">
                  <IconButton 
                    size="small"
                    onClick={() => navigate(`/tasks/${task.task_id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'very high/must': return 'error';
    case 'high/should': return 'warning';
    case 'normal/could': return 'info';
    case 'low/would': return 'success';
    default: return 'default';
  }
};

export default TaskTable; 