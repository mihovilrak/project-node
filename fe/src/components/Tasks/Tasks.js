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
  Alert,
  Chip
} from '@mui/material';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
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

  const handleDelete = async (taskId) => {
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

  const getPriorityColor = (priority) => {
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
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      <Typography variant="h4" gutterBottom>Tasks</Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/tasks/new')}>
        Create New Task
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && tasks.length === 0 ? (
        <Typography variant="body1" sx={{ marginTop: 4 }}>
          No tasks yet.
        </Typography>
      ) : (
        <Grid container spacing={2} marginTop={4}>
          {tasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.task_id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{task.name}</Typography>
                  <Typography variant="body2">Project: {task.project_name}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={task.status}
                      size="small"
                      color={task.status === 'Done' ? 'success' : 'default'}
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Assignee: {task.assignee_name || 'Unassigned'}
                  </Typography>
                  <Box marginTop={2}>
                    <Button onClick={() => navigate(`/tasks/${task.task_id}`)}>
                      Details
                    </Button>
                    <PermissionButton 
                      requiredPermission="Edit tasks"
                      color="warning" 
                      onClick={() => navigate(`/tasks/${task.task_id}/edit`)}
                      tooltipText="You don't have permission to edit tasks"
                    >
                      Edit
                    </PermissionButton>
                    <PermissionButton 
                      requiredPermission="Delete tasks"
                      color="error" 
                      onClick={() => handleDelete(task.task_id)}
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
      )}
    </Box>
  );
};

export default Tasks;