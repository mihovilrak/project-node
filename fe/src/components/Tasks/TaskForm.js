import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField,
    Button,
    MenuItem,
    Box,
    Typography,
    Paper
} from '@mui/material';
import { getTaskById,
    createTask,
    getTaskStatuses,
    getPriorities
} from '../../api/tasks';
import { getProjects } from '../../api/projects';
import { getUsers } from '../../api/users';
import TaskTypeSelect from './TaskTypeSelect';
import TagSelect from './TagSelect';
import { getTags } from '../../api/tags';

const TaskForm = ({ taskId }) => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    name: '',
    project_id: '',
    holder_id: '',
    assignee_id: '',
    description: '',
    priority_id: '',
    start_date: '',
    due_date: '',
    type_id: '',
    tags: []
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setProjects(await getProjects());
      setUsers(await getUsers());
      setStatuses(await getTaskStatuses());
      setPriorities(await getPriorities());
    };
    fetchData();

    if (taskId) {
      fetchTaskData(taskId);
    }
  }, [taskId]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };
    fetchTags();
  }, []);

  const fetchTaskData = async (id) => {
    const task = await getTaskById(id);
    setFormValues(task);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...formValues,
        tag_ids: formValues.tags.map(tag => tag.id)
      };
      const newTask = await createTask(taskData);
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4">{taskId ? 'Edit Task' : 'Add New Task'}</Typography>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Task Name" name="name" value={formValues.name} onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField select fullWidth label="Project" name="project_id" value={formValues.project_id} onChange={handleChange} required sx={{ mb: 2 }}>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
            ))}
          </TextField>
          <TextField select fullWidth label="Holder" name="holder_id" value={formValues.holder_id} onChange={handleChange} required sx={{ mb: 2 }}>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
            ))}
          </TextField>
          <TextField select fullWidth label="Assignee" name="assignee_id" value={formValues.assignee_id} onChange={handleChange} required sx={{ mb: 2 }}>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Description" name="description" value={formValues.description} onChange={handleChange} required multiline rows={4} sx={{ mb: 2 }} />
          <TextField select fullWidth label="Priority" name="priority_id" value={formValues.priority_id} onChange={handleChange} required sx={{ mb: 2 }}>
            {priorities.map((priority) => (
              <MenuItem key={priority.id} value={priority.id}>{priority.priority}</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Start Date" type="date" name="start_date" value={formValues.start_date} onChange={handleChange} required InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
          <TextField fullWidth label="Due Date" type="date" name="due_date" value={formValues.due_date} onChange={handleChange} required InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
          <TaskTypeSelect
            value={formValues.type_id}
            onChange={(e) => setFormValues(prev => ({ ...prev, type_id: e.target.value }))}
            required
          />
          <TagSelect
            value={formValues.tags}
            onChange={(_, newValue) => setFormValues(prev => ({ ...prev, tags: newValue }))}
            tags={availableTags}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>{taskId ? 'Update Task' : 'Create Task'}</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default TaskForm;
