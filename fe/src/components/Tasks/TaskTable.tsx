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
import { TaskTableProps } from '../../types/task';
import { getPriorityColor } from '../../utils/taskUtils';

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
          {tasks.map((task) => (
            <TableRow key={task.id}>
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
                  label={task.status_name}
                  size="small"
                  color={task.status_name === 'Done' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={task.priority_name}
                  size="small"
                  color={getPriorityColor(task.priority_name || '')}
                />
              </TableCell>
              <TableCell>{task.holder_name}</TableCell>
              <TableCell>
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell>
                <Tooltip title="Edit Task">
                  <IconButton 
                    size="small"
                    onClick={() => navigate(`/tasks/${task.id}`)}
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

export default TaskTable;
