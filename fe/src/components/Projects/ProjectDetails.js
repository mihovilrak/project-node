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
import { getProjectById, deleteProject } from '../../api/projects';
import { getProjectTasks } from '../../api/tasks';
import TaskList from '../Tasks/TaskList';
import ProjectGantt from './ProjectGantt';
import ProjectMembers from './ProjectMembers';
import ProjectEditDialog from './ProjectEditDialog';
import TaskForm from '../Tasks/TaskForm';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, hasPermission } = useAuth();
    
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
    useEffect(() => {
      fetchProjectData();
    }, [id]);
  
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const [projectData, tasksData] = await Promise.all([
          getProjectById(id),
          getProjectTasks(id)
        ]);
        setProject(projectData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Failed to fetch project details:', error);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };
  
    const handleTabChange = (event, newValue) => {
      setActiveTab(newValue);
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
              {hasPermission('update_projects') && (
                <IconButton onClick={handleEditClick} sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
              )}
              {hasPermission('delete_projects') && (
                <IconButton onClick={handleDeleteClick} color="error">
                  <DeleteIcon />
                </IconButton>
              )}
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
                  label={`Status: ${project.status}`}
                  color={project.status === 'Active' ? 'success' : 'default'}
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
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Tasks" />
            <Tab label="Timeline" />
            <Tab label="Members" />
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
            {hasPermission('create_tasks') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateTask}
                sx={{ mb: 2 }}
              >
                Create Task
              </Button>
            )}
            <TaskList 
              tasks={tasks}
              onTaskUpdated={fetchProjectData}
              projectId={id}
            />
          </Box>
        )}
  
        {activeTab === 2 && (
          <ProjectGantt projectId={id} />
        )}
  
        {activeTab === 3 && (
          <ProjectMembers 
            projectId={id}
            members={project.members || []}
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