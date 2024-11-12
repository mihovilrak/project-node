// src/components/Projects/ProjectDetail.js
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
import { getProjectById, deleteProject, getProjectMembers } from '../../api/projects';
import { getProjectTasks } from '../../api/tasks';
import TaskList from '../Tasks/TaskList';
import ProjectGantt from './ProjectGantt';
import ProjectMembers from './ProjectMembers';
import ProjectEditDialog from './ProjectEditDialog';
import TaskForm from '../Tasks/TaskForm';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import PermissionIconButton from '../common/PermissionIconButton';
import PermissionButton from '../common/PermissionButton';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, hasPermission } = useAuth();
    if (!hasPermission) {
      console.error('hasPermission is not available in AuthContext');
      return null;
    }
    
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [members, setMembers] = useState([]);
  
    useEffect(() => {
      fetchProjectData();
    }, [id]);
  
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const [projectData, tasksData, membersData] = await Promise.all([
          getProjectById(id),
          getProjectTasks(id),
          getProjectMembers(id)
        ]);
        
        if (!projectData) {
          setError('Project not found');
          return;
        }
        
        setProject(projectData);
        setTasks(tasksData || []);
        setMembers(membersData || []);
      } catch (error) {
        console.error('Failed to fetch project details:', error);
        setError(error.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    };
  
    const handleTabChange = (event, newValue) => {
      if (typeof newValue === 'number') {
        setActiveTab(newValue);
      }
    };
  
    const handleEditClick = () => {
      setEditDialogOpen(true);
    };
  
    const handleEditClose = () => {
      setEditDialogOpen(false);
    };
    const handleEditSaved = () => {
      setEditDialogOpen(false);
      fetchProjectData();
    };
  
    const handleCreateTask = () => {
      setCreateTaskDialogOpen(true);
    };
  
    const handleTaskCreated = () => {
      setCreateTaskDialogOpen(false);
      fetchProjectData();
    };
  
    const handleDeleteClick = () => {
      setDeleteDialogOpen(true);
    };
  
    const handleDeleteConfirm = async () => {
      try {
        await deleteProject(id);
        navigate('/projects');
      } catch (error) {
        console.error('Failed to delete project:', error);
        setError('Failed to delete project');
      }
      setDeleteDialogOpen(false);
    };
  
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }
  
    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }
  
    if (!project) {
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          Project not found
        </Alert>
      );
    }
  
    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2 
          }}>
            <Typography variant="h5" component="h1">
              {project.name}
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
                {project.description}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Status: ${project.status_id === 1 ? 'Active' : 'Inactive'}`}
                  color={project.status_id === 1 ? 'success' : 'default'}
                />
                <Chip 
                  label={`Tasks: ${tasks.length}`}
                  color="primary"
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
  
        {/* Tabs and Content */}
        <Box sx={{ mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="project tabs"
          >
            <Tab label="Overview" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Tasks" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Timeline" id="tab-2" aria-controls="tabpanel-2" />
            <Tab label="Members" id="tab-3" aria-controls="tabpanel-3" />
          </Tabs>
        </Box>
  
        {/* Tab Panels */}
        {activeTab === 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Project Overview</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Start Date</Typography>
                <Typography>
                  {new Date(project.start_date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Due Date</Typography>
                <Typography>
                  {new Date(project.due_date).toLocaleDateString()}
                </Typography>
              </Grid>
              {/* Add more project details as needed */}
            </Grid>
          </Paper>
        )}
  
        {activeTab === 1 && (
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
            {tasks.length === 0 ? (
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
              <TaskList 
                tasks={tasks}
                onTaskUpdated={fetchProjectData}
                projectId={id}
              />
            )}
          </Box>
        )}
  
        {activeTab === 2 && (
          tasks.length === 0 ? (
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
              projectId={id} 
              tasks={tasks}
            />
          )
        )}
  
        {activeTab === 3 && (
          <ProjectMembers 
            projectId={id}
            members={members}
            onMembersUpdated={fetchProjectData}
          />
        )}
  
        {/* Dialogs */}
        <ProjectEditDialog
          open={editDialogOpen}
          project={project}
          onClose={handleEditClose}
          onSaved={handleEditSaved}
        />
  
        <TaskForm
          open={createTaskDialogOpen}
          projectId={id}
          onClose={() => setCreateTaskDialogOpen(false)}
          onCreated={handleTaskCreated}
        />
  
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          title="Delete Project"
          content="Are you sure you want to delete this project? This action cannot be undone."
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </Box>
    );
  };
  
  export default ProjectDetails;