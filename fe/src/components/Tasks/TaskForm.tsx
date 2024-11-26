import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Paper
} from '@mui/material';
import {
  getTaskById,
  createTask,
  updateTask,
  getTaskStatuses,
  getPriorities,
  getTasks
} from '../../api/tasks';
import { useAuth } from '../../context/AuthContext';
import { getProjects } from '../../api/projects';
import { getUsers } from '../../api/users';
import TaskTypeSelect from './TaskTypeSelect';
import TagSelect from './TagSelect';
import { getTags, getTaskTags } from '../../api/tags';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskFormValues,
  Tag,
  TaskFormProps
} from '../../types/task';
import { Project } from '../../types/project';
import { User } from '../../types/user';

const TaskForm: React.FC<TaskFormProps> = ({ taskId }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [formValues, setFormValues] = useState<TaskFormValues>({
    name: '',
    description: '',
    start_date: '',
    due_date: '',
    priority_id: 2,
    status_id: 1,
    type_id: 1,
    parent_id: null,
    project_id: '',
    holder_id: '',
    assignee_id: '',
    created_by: currentUser?.id,
    tags: []
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, usersData, statusesData, prioritiesData, allTasks, tagsData] = await Promise.all([
          getProjects(),
          getUsers(),
          getTaskStatuses(),
          getPriorities(),
          getTasks(),
          getTags()
        ]);

        setProjects(projectsData);
        setUsers(usersData);
        setStatuses(statusesData);
        setPriorities(prioritiesData);
        setTasks(allTasks.filter(task => task.id !== Number(taskId)));
        setAvailableTags(tagsData);

        if (taskId) {
          const taskData = await getTaskById(Number(taskId));
          const taskTags = await getTaskTags(Number(taskId));
          setFormValues({
            name: taskData.name,
            description: taskData.description || '',
            start_date: taskData.start_date,
            due_date: taskData.due_date,
            priority_id: taskData.priority_id,
            status_id: taskData.status_id,
            type_id: taskData.type_id,
            parent_id: taskData.parent_id || null,
            project_id: taskData.project_id,
            holder_id: taskData.holder_id,
            assignee_id: taskData.assignee_id || '',
            created_by: taskData.created_by,
            tags: taskTags || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [taskId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { tags, ...restFormValues } = formValues;
      
      const taskData: Partial<Task> = {
        ...restFormValues,
        project_id: Number(restFormValues.project_id),
        holder_id: Number(restFormValues.holder_id),
        assignee_id: Number(restFormValues.assignee_id),
        parent_id: restFormValues.parent_id || undefined,
        tags: tags
      };
      
      if (taskId) {
        await updateTask(Number(taskId), taskData);
      } else {
        await createTask(taskData);
      }
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4">{taskId ? 'Edit Task' : 'Add New Task'}</Typography>
        <form onSubmit={handleSubmit}>
          <TextField 
            fullWidth 
            label="Task Name" 
            name="name" 
            value={formValues.name} 
            onChange={handleChange} 
            required 
            sx={{ mb: 2 }} 
          />
          
          <TextField 
            select 
            fullWidth 
            label="Project" 
            name="project_id" 
            value={formValues.project_id} 
            onChange={handleChange} 
            required 
            sx={{ mb: 2 }}
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField 
            select 
            fullWidth 
            label="Holder" 
            name="holder_id" 
            value={formValues.holder_id} 
            onChange={handleChange} 
            required 
            sx={{ mb: 2 }}
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField 
            select 
            fullWidth 
            label="Assignee" 
            name="assignee_id" 
            value={formValues.assignee_id} 
            onChange={handleChange} 
            required 
            sx={{ mb: 2 }}
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField 
            fullWidth 
            label="Description" 
            name="description" 
            value={formValues.description} 
            onChange={handleChange} 
            required 
            multiline 
            rows={4} 
            sx={{ mb: 2 }} 
          />
          
          <TextField 
            select 
            fullWidth 
            label="Priority" 
            name="priority_id" 
            value={formValues.priority_id} 
            onChange={handleChange} 
            required 
            sx={{ mb: 2 }}
          >
            {priorities.map((priority) => (
              <MenuItem key={priority.id} value={priority.id}>
                {priority.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField 
            select 
            fullWidth 
            label="Status" 
            name="status_id" 
            value={formValues.status_id} 
            onChange={handleChange} 
            required 
            sx={{ mb: 2 }}
          >
            {statuses.map((status) => (
              <MenuItem key={status.id} value={status.id}>
                {status.name}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField 
            fullWidth 
            label="Start Date" 
            type="date" 
            name="start_date" 
            value={formValues.start_date} 
            onChange={handleChange} 
            required 
            InputLabelProps={{ shrink: true }} 
            sx={{ mb: 2 }} 
          />
          
          <TextField 
            fullWidth 
            label="Due Date" 
            type="date" 
            name="due_date" 
            value={formValues.due_date} 
            onChange={handleChange} 
            required 
            InputLabelProps={{ shrink: true }} 
            sx={{ mb: 2 }} 
          />
          
          <TextField 
            select 
            fullWidth 
            label="Parent Task (Optional)" 
            name="parent_id" 
            value={formValues.parent_id || ''} 
            onChange={handleChange} 
            sx={{ mb: 2 }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {tasks.map((task) => (
              <MenuItem key={task.id} value={task.id}>
                {task.name}
              </MenuItem>
            ))}
          </TextField>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Task Type</Typography>
            <TaskTypeSelect
              value={formValues.type_id}
              onChange={(e) => setFormValues(prev => ({ ...prev, type_id: Number(e.target.value) }))}
              required
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Tags</Typography>
            <TagSelect
              value={formValues.tags}
              onChange={(newValue: Tag[]) => setFormValues(prev => ({ ...prev, tags: newValue }))}
            />
          </Box>
          
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            {taskId ? 'Update Task' : 'Create Task'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default TaskForm; 