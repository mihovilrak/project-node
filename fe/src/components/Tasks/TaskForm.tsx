import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
import { 
  getProjects, 
  getProjectMembers 
} from '../../api/projects';
import { getUsers } from '../../api/users';
import TaskTypeSelect from './TaskTypeSelect';
import TagSelect from './TagSelect';
import { getTags, getTaskTags } from '../../api/tags';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskFormState,
  TaskFormProps
} from '../../types/task';
import { Project, ProjectMember } from '../../types/project';
import { User } from '../../types/user';
import { Tag } from '../../types/tag';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const TaskForm: React.FC<TaskFormProps> = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const today = dayjs();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectIdFromQuery = queryParams.get('projectId');
  const parentTaskId = queryParams.get('parentTaskId');
  const { projectId, taskId } = useParams();
  const isEditing = Boolean(taskId);

  const [formData, setFormData] = useState<TaskFormState>({
    name: '',
    description: '',
    start_date: today.toISOString(),
    due_date: '',
    priority_id: 2,
    status_id: 1,
    type_id: 1,
    parent_id: parentTaskId ? Number(parentTaskId) : null,
    project_id: projectIdFromQuery ? Number(projectIdFromQuery) : (projectId ? Number(projectId) : 0),
    holder_id: 0,
    assignee_id: null,
    created_by: currentUser?.id,
    tags: [],
    estimated_time: 0
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, usersData, statusesData, prioritiesData, tagsData] = await Promise.all([
          getProjects(),
          getUsers(),
          getTaskStatuses(),
          getPriorities(),
          getTags()
        ]);

        setProjects(projectsData);
        setUsers(usersData);
        setStatuses(statusesData);
        setPriorities(prioritiesData);
        setAvailableTags(tagsData);

        if (taskId) {
          const taskData = await getTaskById(Number(taskId));
          const taskTags = await getTaskTags(Number(taskId));
          setFormData({
            name: taskData.name,
            description: taskData.description || '',
            start_date: taskData.start_date,
            due_date: taskData.due_date,
            priority_id: taskData.priority_id,
            status_id: taskData.status_id,
            type_id: taskData.type_id,
            parent_id: taskData.parent_id,
            project_id: taskData.project_id,
            holder_id: taskData.holder_id,
            assignee_id: taskData.assignee_id,
            created_by: taskData.created_by,
            tags: taskTags || [],
            estimated_time: taskData.estimated_time || 0
          });

          if (taskData.project_id) {
            const members = await getProjectMembers(taskData.project_id);
            setProjectMembers(members);
            const tasks = await getTasks({ projectId: taskData.project_id });
            setProjectTasks(tasks.filter(t => t.id !== Number(taskId)));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [taskId]);

  useEffect(() => {
    const updateProjectData = async () => {
      if (formData.project_id) {
        try {
          const [projectMembersData, projectTasksData] = await Promise.all([
            getProjectMembers(formData.project_id),
            getTasks({ project_id: formData.project_id })
          ]);
          setProjectMembers(projectMembersData);
          setProjectTasks(projectTasksData.filter(task => task.id !== Number(taskId)));
          
          const memberIds = projectMembersData.map(member => member.user_id);
          if (formData.holder_id && !memberIds.includes(formData.holder_id)) {
            setFormData(prev => ({ ...prev, holder_id: 0 }));
          }
          if (formData.assignee_id && !memberIds.includes(formData.assignee_id)) {
            setFormData(prev => ({ ...prev, assignee_id: null }));
          }
        } catch (error) {
          console.error('Failed to fetch project data:', error);
        }
      }
    };

    updateProjectData();
  }, [formData.project_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateTask(Number(taskId), formData);
      } else {
        await createTask(formData);
      }
      navigate(-1);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const datePickerStyle = {
    width: '100%',
    marginBottom: 2
  };

  return (
    <Box sx={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4">{isEditing ? 'Edit Task' : 'Add New Task'}</Typography>
        <form onSubmit={handleSubmit}>
          <TextField 
            fullWidth 
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField 
            select 
            fullWidth 
            label="Project" 
            name="project_id" 
            value={formData.project_id} 
            onChange={handleChange} 
            required 
            sx={{ mb: 2 }}
            disabled={!!projectIdFromQuery}
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
            value={formData.holder_id} 
            onChange={handleChange} 
            required 
            sx={{ mb: 2 }}
          >
            {projectMembers.map((member) => (
              <MenuItem key={member.user_id} value={member.user_id}>
                {member.name} {member.surname}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField 
            select 
            fullWidth 
            label="Assignee" 
            name="assignee_id" 
            value={formData.assignee_id} 
            onChange={handleChange} 
            sx={{ mb: 2 }}
          >
            <MenuItem value="">None</MenuItem>
            {projectMembers.map((member) => (
              <MenuItem key={member.user_id} value={member.user_id}>
                {member.name} {member.surname}
              </MenuItem>
            ))}
          </TextField>

          {formData.project_id && (
            <TextField 
              select 
              fullWidth 
              label="Parent Task" 
              name="parent_id" 
              value={formData.parent_id || ''} 
              onChange={handleChange} 
              sx={{ mb: 2 }}
            >
              <MenuItem value="">None</MenuItem>
              {projectTasks.map((task) => (
                <MenuItem key={task.id} value={task.id}>
                  {task.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          
          <DatePicker
            label="Start Date"
            value={dayjs(formData.start_date)}
            onChange={(newValue) => handleChange({
              target: { name: 'start_date', value: newValue ? newValue.toISOString() : '' }
            } as any)}
            sx={datePickerStyle}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                sx: { mb: 2 }
              }
            }}
          />
          
          <DatePicker
            label="Due Date"
            value={formData.due_date ? dayjs(formData.due_date) : null}
            onChange={(newValue) => handleChange({
              target: { name: 'due_date', value: newValue ? newValue.toISOString() : '' }
            } as any)}
            sx={datePickerStyle}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                sx: { mb: 2 }
              }
            }}
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Estimated Time (hours)"
            name="estimated_time"
            type="number"
            value={formData.estimated_time}
            onChange={handleChange}
            inputProps={{ min: 0, step: 0.5 }}
            sx={{ mb: 2 }}
          />

          <TextField 
            select 
            fullWidth 
            label="Priority" 
            name="priority_id" 
            value={formData.priority_id} 
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
            value={formData.status_id} 
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
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Task Type</Typography>
            <TaskTypeSelect
              value={formData.type_id}
              onChange={(e) => setFormData(prev => ({ ...prev, type_id: Number(e.target.value) }))}
              required
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Tags</Typography>
            <TagSelect
              selectedTags={formData.tags}
              onTagsChange={(newTags: Tag[]) => {
                setFormData(prev => ({
                  ...prev,
                  tags: newTags
                }));
              }}
            />
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button type="button" onClick={() => navigate(-1)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default TaskForm;
