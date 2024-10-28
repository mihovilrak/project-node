import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, deleteTask } from '../../api/tasks';
import { Grid, Button, Card, CardContent, Typography, Box } from '@mui/material';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const taskList = await getTasks();
      setTasks(taskList);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        fetchTasks();
      } catch (error) {
        console.error('Failed to delete task', error);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <Typography variant="h4" gutterBottom>Tasks</Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/tasks/new')}>
        Create New Task
      </Button>
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <>
          {tasks.length === 0 ? (
            <Typography variant="body1" sx={{ marginTop: 4 }}>
              No tasks yet.
            </Typography>
          ) : (
            <Grid container spacing={2} marginTop={4}>
              {tasks.map((task) => (
                <Grid item xs={12} sm={6} md={4} key={task.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{task.name}</Typography>
                      <Typography variant="body2">Project: {task.project}</Typography>
                      <Typography variant="body2">Status: {task.status}</Typography>
                      <Typography variant="body2">Priority: {task.priority}</Typography>
                      <Box marginTop={2}>
                        <Button onClick={() => navigate(`/tasks/${task.id}`)}>Details</Button>
                        <Button color="warning" onClick={() => navigate(`/tasks/edit/${task.id}`)}>Edit</Button>
                        <Button color="error" onClick={() => handleDelete(task.id)}>Delete</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default Tasks;
