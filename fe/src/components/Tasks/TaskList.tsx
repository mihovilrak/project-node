import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Grid
} from '@mui/material';
import { getTasks, deleteTask } from '../../api/tasks';
import { Task } from '../../types/task';
import PermissionButton from '../common/PermissionButton';

const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {tasks.map((task) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                {task.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {task.description}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={task.status_name}
                  color={task.status_name === 'Done' ? 'success' : 'default'}
                />
                <Chip
                  label={task.priority_name}
                  color={task.priority_name === 'High/Should' ? 'error' : 'default'}
                />
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Assignee: {task.assignee_name || 'Unassigned'}
              </Typography>
              <Box marginTop={2}>
                <Button onClick={() => navigate(`/tasks/${task.id}`)}>
                  Details
                </Button>
                <PermissionButton
                  requiredPermission="Edit tasks"
                  color="warning"
                  onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                  Edit
                </PermissionButton>
                <PermissionButton
                  requiredPermission="Delete tasks"
                  color="error"
                  onClick={() => handleDelete(task.id)}>
                  Delete
                </PermissionButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default TaskList;
