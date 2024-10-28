import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, deleteTask, changeTaskStatus } from '../../api/tasks';
import { Box, Typography, Button, Paper } from '@mui/material';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      const taskData = await getTaskById(id);
      setTask(taskData);
    };
    fetchTask();
  }, [id]);

  const handleDelete = async () => {
    await deleteTask(id);
    navigate('/tasks');
  };

  const handleStatusChange = async (newStatus) => {
    await changeTaskStatus(id, { status: newStatus });
    const updatedTask = await getTaskById(id);
    setTask(updatedTask);
  };

  return task ? (
    <Box sx={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4">{task.name}</Typography>
        <Typography variant="body1">Project: {task.project}</Typography>
        <Typography variant="body1">Holder: {task.holder}</Typography>
        <Typography variant="body1">Assignee: {task.assignee}</Typography>
        <Typography variant="body1">Priority: {task.priority}</Typography>
        <Typography variant="body1">Status: {task.status}</Typography>
        <Typography variant="body1">Start Date: {new Date(task.start_date).toLocaleDateString()}</Typography>
        <Typography variant="body1">Due Date: {new Date(task.due_date).toLocaleDateString()}</Typography>
        <Typography variant="body1">Description: {task.description}</Typography>
        <Box sx={{ mt: 2 }}>
          <Button onClick={() => handleStatusChange('Completed')}>Mark as Completed</Button>
          <Button color="error" onClick={handleDelete} sx={{ ml: 2 }}>Delete Task</Button>
        </Box>
      </Paper>
    </Box>
  ) : (
    <p>Loading...</p>
  );
};

export default TaskDetails;
