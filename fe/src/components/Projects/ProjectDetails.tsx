import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import { useProjectDetails } from '../../hooks/project/useProjectDetails';
import ProjectEditDialog from './ProjectEditDialog';
import TimeLogDialog from '../TimeLog/TimeLogDialog';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import EditMembersDialog from './EditMembersDialog';
import ProjectActions from './ProjectActions';
import ProjectTabPanels from './ProjectTabPanels';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const {
    project,
    projectDetails,
    members,
    tasks,
    timeLogs,
    loading,
    error,
    editDialogOpen,
    deleteDialogOpen,
    taskFormOpen,
    timeLogDialogOpen,
    manageMembersOpen,
    selectedTimeLog,
    canEdit,
    canDelete,
    canManageMembers,
    setState,
    handleProjectUpdate,
    handleProjectDelete,
    handleMemberRemove,
    handleTaskCreate,
    handleTimeLogSubmit,
    handleTimeLogEdit,
    handleTimeLogDelete,
    handleMembersUpdate,
    setTimeLogDialogOpen,
    setSelectedTimeLog,
    setTaskFormOpen,
    setManageMembersOpen
  } = useProjectDetails(id!);

  const handleCreateTask = useCallback(() => {
    navigate(`/tasks/new?projectId=${id}`);
    setTaskFormOpen(false);
  }, [navigate, id, setTaskFormOpen]);

  const handleTabChange = useCallback((_e: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleEdit = useCallback(() => {
    setState(prev => ({ ...prev, editDialogOpen: true }));
  }, [setState]);

  const handleDelete = useCallback(() => {
    setState(prev => ({ ...prev, deleteDialogOpen: true }));
  }, [setState]);

  const handleManageMembers = useCallback(() => {
    setManageMembersOpen(true);
  }, [setManageMembersOpen]);

  const handleTimeLogCreate = useCallback(() => {
    setSelectedTimeLog(null);
    setTimeLogDialogOpen(true);
  }, [setSelectedTimeLog, setTimeLogDialogOpen]);

  const handleEditDialogClose = useCallback(() => {
    setState(prev => ({ ...prev, editDialogOpen: false }));
  }, [setState]);

  const handleDeleteDialogClose = useCallback(() => {
    setState(prev => ({ ...prev, deleteDialogOpen: false }));
  }, [setState]);

  const handleTimeLogDialogClose = useCallback(() => {
    setTimeLogDialogOpen(false);
    setSelectedTimeLog(null);
  }, [setTimeLogDialogOpen, setSelectedTimeLog]);

  const handleEditMembersDialogClose = useCallback(() => {
    setManageMembersOpen(false);
  }, [setManageMembersOpen]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!project) return <Alert severity="error">Project not found</Alert>;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            {project?.name || 'Unnamed Project'}
          </Typography>
          <ProjectActions
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={() => setState(prev => ({ ...prev, editDialogOpen: true }))}
            onDelete={() => setState(prev => ({ ...prev, deleteDialogOpen: true }))}
            data-testid="project-actions"
          />
        </Box>

        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => {
            e.preventDefault();
            setActiveTab(newValue);
          }} 
          data-testid="project-tabs"
        >
          <Tab label="Overview" data-testid="tab-overview" />
          <Tab label="Tasks" data-testid="tab-tasks" />
          <Tab label="Members" data-testid="tab-members" />
          <Tab label="Time Log" data-testid="tab-timelog" />
          <Tab label="Gantt" data-testid="tab-gantt" />
        </Tabs>

        <ProjectTabPanels
          activeTab={activeTab}
          project={project}
          projectDetails={projectDetails}
          tasks={tasks || []}
          members={members || []}
          timeLogs={timeLogs || []}
          canManageMembers={canManageMembers}
          projectId={id || ''}
          onCreateTask={handleCreateTask}
          onManageMembers={handleManageMembers}
          onTimeLogCreate={handleTimeLogCreate}
          onTimeLogEdit={handleTimeLogEdit}
          onTimeLogDelete={handleTimeLogDelete}
          onMemberRemove={handleMemberRemove}
        />
      </Paper>

      <ProjectEditDialog
        open={editDialogOpen}
        project={project}
        onClose={handleEditDialogClose}
        onSaved={handleProjectUpdate}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Project"
        content="Are you sure you want to delete this project? This action cannot be undone."
        onClose={handleDeleteDialogClose}
        onConfirm={handleProjectDelete}
      />

      <TimeLogDialog
        open={timeLogDialogOpen}
        onClose={handleTimeLogDialogClose}
        onSubmit={handleTimeLogSubmit}
        timeLog={selectedTimeLog}
        projectId={id ? Number(id) : undefined}
      />

      {id && (
        <EditMembersDialog
          open={manageMembersOpen}
          onClose={handleEditMembersDialogClose}
          projectId={Number(id)}
          currentMembers={members || []}
          onSave={handleMembersUpdate}
        />
      )}
    </Box>
  );
};

export default ProjectDetails;
