import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import ProjectEditDialog from './ProjectEditDialog';
import ProjectMembers from './ProjectMembers';
import TaskForm from '../Tasks/TaskForm';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import { useProjectDetails } from '../../hooks/useProjectDetails';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    project,
    members,
    loading,
    error,
    editDialogOpen,
    deleteDialogOpen,
    createTaskDialogOpen,
    handleProjectUpdate,
    handleProjectDelete,
    handleTaskCreate,
    setEditDialogOpen,
    setDeleteDialogOpen,
    setCreateTaskDialogOpen
  } = useProjectDetails(id!);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!project) return <Alert severity="error">Project not found</Alert>;

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">{project.name}</Typography>
        <Typography variant="body1">{project.description}</Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setCreateTaskDialogOpen(true)}
          sx={{ mt: 2 }}
        >
          Add New Task
        </Button>

        <ProjectMembers 
          members={members}
          projectId={project.id}
        />

        <ProjectEditDialog
          open={editDialogOpen}
          project={project}
          onClose={() => setEditDialogOpen(false)}
          onSaved={() => handleProjectUpdate(project)}
        />

        {createTaskDialogOpen && (
          <TaskForm
            open={createTaskDialogOpen}
            projectId={project.id}
            onClose={() => setCreateTaskDialogOpen(false)}
            onCreated={() => {
              handleTaskCreate({ project_id: project.id } as any);
              setCreateTaskDialogOpen(false);
            }}
          />
        )}

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          title="Delete Project"
          content="Are you sure you want to delete this project?"
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleProjectDelete}
        />
      </Paper>
    </Box>
  );
};

export default ProjectDetails; 