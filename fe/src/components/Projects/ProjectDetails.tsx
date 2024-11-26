import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { 
    getProjectById, 
    deleteProject, 
    getProjectMembers 
} from '../../api/projects';
import { getProjectTasks } from '../../api/tasks';
import TaskList from '../Tasks/TaskList';
import ProjectGantt from './ProjectGantt';
import ProjectMembers from './ProjectMembers';
import ProjectEditDialog from './ProjectEditDialog';
import TaskForm from '../Tasks/TaskForm';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import PermissionIconButton from '../common/PermissionIconButton';
import PermissionButton from '../common/PermissionButton';
import { 
  ProjectDetailsState,
  ProjectTab 
} from '../../types/project';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, hasPermission } = useAuth();

  const [state, setState] = useState<ProjectDetailsState>({
    project: null,
    tasks: [],
    loading: true,
    error: null,
    activeTab: 0,
    editDialogOpen: false,
    createTaskDialogOpen: false,
    deleteDialogOpen: false,
    members: []
  });

  const tabs: ProjectTab[] = [
    { id: 0, label: 'Overview', ariaControls: 'tabpanel-0' },
    { id: 1, label: 'Tasks', ariaControls: 'tabpanel-1' },
    { id: 2, label: 'Timeline', ariaControls: 'tabpanel-2' },
    { id: 3, label: 'Members', ariaControls: 'tabpanel-3' }
  ];

  useEffect(() => {
    if (!id) return;
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const [projectData, tasksData, membersData] = await Promise.all([
        getProjectById(parseInt(id!)),
        getProjectTasks(parseInt(id!)),
        getProjectMembers(parseInt(id!))
      ]);
      
      setState(prev => ({
        ...prev,
        project: projectData,
        tasks: tasksData || [],
        members: membersData || [],
        loading: false
      }));
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load project details',
        loading: false
      }));
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setState(prev => ({ ...prev, activeTab: newValue }));
  };

  const handleEditClick = (): void => {
    setState(prev => ({ ...prev, editDialogOpen: true }));
  };

  const handleEditClose = (): void => {
    setState(prev => ({ ...prev, editDialogOpen: false }));
  };

  const handleEditSaved = (): void => {
    setState(prev => ({ ...prev, editDialogOpen: false }));
    fetchProjectData();
  };

  const handleCreateTask = (): void => {
    setState(prev => ({ ...prev, createTaskDialogOpen: true }));
  };

  const handleTaskCreated = (): void => {
    setState(prev => ({ ...prev, createTaskDialogOpen: false }));
    fetchProjectData();
  };

  const handleDeleteClick = (): void => {
    setState(prev => ({ ...prev, deleteDialogOpen: true }));
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!id) return;
    
    try {
      await deleteProject(parseInt(id));
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      setState(prev => ({ ...prev, error: 'Failed to delete project' }));
    }
    setState(prev => ({ ...prev, deleteDialogOpen: false }));
  };

  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {state.error}
      </Alert>
    );
  }

  if (!state.project) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Project not found
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}>
          <Typography variant="h5" component="h1">
            {state.project.name}
          </Typography>
          <Box>
            <PermissionIconButton
              requiredPermission="Edit projects"
              onClick={handleEditClick}
              sx={{ mr: 1 }}
              tooltipText="You don't have permission to edit this project"
            >
              <EditIcon />
            </PermissionIconButton>
            <PermissionIconButton
              requiredPermission="Delete projects"
              onClick={handleDeleteClick}
              color="error"
              tooltipText="You don't have permission to delete this project"
            >
              <DeleteIcon />
            </PermissionIconButton>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography color="textSecondary" paragraph>
              {state.project.description}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`Status: ${state.project.status_id === 1 ? 'Active' : 'Inactive'}`}
                color={state.project.status_id === 1 ? 'success' : 'default'}
              />
              <Chip 
                label={`Tasks: ${state.tasks.length}`}
                color="primary"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={state.activeTab} 
          onChange={handleTabChange}
          aria-label="project tabs"
        >
          {tabs.map(tab => (
            <Tab 
              key={tab.id}
              label={tab.label} 
              id={`tab-${tab.id}`} 
              aria-controls={tab.ariaControls} 
            />
          ))}
        </Tabs>
      </Box>

      {state.activeTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Project Overview</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Start Date</Typography>
              <Typography>
                {new Date(state.project.start_date).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Due Date</Typography>
              <Typography>
                {new Date(state.project.due_date).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {state.activeTab === 1 && (
        <Box>
          <PermissionButton
            requiredPermission="Create tasks"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTask}
            sx={{ mb: 2 }}
            tooltipText="You don't have permission to create tasks"
          >
            Create Task
          </PermissionButton>
          {state.tasks.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Tasks Yet
              </Typography>
              <Typography color="textSecondary" paragraph>
                This project doesn't have any tasks. 
                {hasPermission('Create tasks') && " Click the 'Create Task' button above to get started."}
              </Typography>
            </Paper>
          ) : (
            <TaskList />
          )}
        </Box>
      )}

      {state.activeTab === 2 && (
        state.tasks.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Timeline Data
            </Typography>
            <Typography color="textSecondary">
              Add tasks to the project to see them on the timeline.
            </Typography>
          </Paper>
        ) : (
          <ProjectGantt 
            projectId={parseInt(id!)} 
            tasks={state.tasks}
          />
        )
      )}

      {state.activeTab === 3 && (
        <ProjectMembers 
          projectId={parseInt(id!)}
          members={state.members}
          onMembersUpdated={fetchProjectData}
        />
      )}

      <ProjectEditDialog
        open={state.editDialogOpen}
        project={state.project}
        onClose={handleEditClose}
        onSaved={handleEditSaved}
      />

      <TaskForm
        taskId={undefined}
        open={state.createTaskDialogOpen}
        onClose={() => setState(prev => ({ ...prev, createTaskDialogOpen: false }))}
        onCreated={handleTaskCreated}
      />

      <DeleteConfirmDialog
        open={state.deleteDialogOpen}
        title="Delete Project"
        content="Are you sure you want to delete this project? This action cannot be undone."
        onClose={() => setState(prev => ({ ...prev, deleteDialogOpen: false }))}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};

export default ProjectDetails; 