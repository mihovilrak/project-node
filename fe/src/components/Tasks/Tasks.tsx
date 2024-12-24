import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, deleteTask } from '../../api/tasks';
import { 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  CircularProgress,
  Chip
} from '@mui/material';
import PermissionButton from '../common/PermissionButton';
import { Task } from '../../types/task';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (): Promise<void> => {
    try {
      setError(null);
      const taskList = await getTasks();
      setTasks(taskList);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        fetchTasks();
      } catch (error) {
        console.error('Failed to delete task', error);
        setError('Failed to delete task. Please try again.');
      }
    }
  };

  const getPriorityColor = (priority: string | undefined): "error" | "warning" | "info" | "success" | "default" => {
    switch (priority?.toLowerCase()) {
      case 'very high/must': return 'error';
      case 'high/should': return 'warning';
      case 'normal/could': return 'info';
      case 'low/would': return 'success';
      default: return 'default';
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
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Tasks</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/tasks/new')}
          sx={{ mb: 2 }}
        >
          Create New Task
        </Button>
      </Box>

      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} lg={4} key={task.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{task.name}</Typography>
                <Typography variant="body2">Project: {task.project_name}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={task.status_name}
                    size="small"
                    color={task.status_name === 'Done' ? 'success' : 'default'}
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={task.priority_name}
                    size="small"
                    color={getPriorityColor(task.priority_name || '')}
                  />
                </Box>
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
                    onClick={() => navigate(`/tasks/${task.id}/edit`)}
                    tooltipText="You don't have permission to edit tasks"
                  >
                    Edit
                  </PermissionButton>
                  <PermissionButton 
                    requiredPermission="Delete tasks"
                    color="error" 
                    onClick={() => handleDelete(task.id)}
                    tooltipText="You don't have permission to delete tasks"
                  >
                    Delete
                  </PermissionButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Tasks;
