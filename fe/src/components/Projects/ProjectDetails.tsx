import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
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
    actionError,
    setActionError,
    tasksError,
    membersError,
    timeLogsError,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    timeLogDialogOpen,
    selectedTimeLog,
    timeLogTaskId,
    manageMembersOpen,
    setManageMembersOpen,
    canEdit,
    canDelete,
    canManageMembers,
    handleProjectUpdate,
    handleProjectDelete,
    handleMemberRemove,
    handleMembersUpdate,
    openTimeLogDialog,
    closeTimeLogDialog,
    handleTimeLogSubmit,
    handleTimeLogEdit,
    handleTimeLogDelete,
  } = useProjectDetails(id!);

  const handleCreateTask = useCallback(() => {
    navigate(`/tasks/new?projectId=${id}`);
  }, [navigate, id]);

  const handleTabChange = useCallback(
    (_e: React.SyntheticEvent, newValue: number) => setActiveTab(newValue),
    [],
  );

  const handleEdit = useCallback(
    () => setEditDialogOpen(true),
    [setEditDialogOpen],
  );
  const handleEditDialogClose = useCallback(
    () => setEditDialogOpen(false),
    [setEditDialogOpen],
  );
  const handleDelete = useCallback(
    () => setDeleteDialogOpen(true),
    [setDeleteDialogOpen],
  );
  const handleDeleteDialogClose = useCallback(
    () => setDeleteDialogOpen(false),
    [setDeleteDialogOpen],
  );
  const handleManageMembers = useCallback(
    () => setManageMembersOpen(true),
    [setManageMembersOpen],
  );
  const handleEditMembersDialogClose = useCallback(
    () => setManageMembersOpen(false),
    [setManageMembersOpen],
  );

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!project) return <Alert severity="error">Project not found</Alert>;

  const subDataError = tasksError || membersError || timeLogsError;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h1">
            {project.name || 'Unnamed Project'}
          </Typography>
          <ProjectActions
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={handleEdit}
            onDelete={handleDelete}
            data-testid="project-actions"
          />
        </Box>

        {actionError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setActionError(null)}
          >
            {actionError}
          </Alert>
        )}

        {subDataError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {subDataError}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          data-testid="project-tabs"
        >
          <Tab label="Overview" id="project-tab-0" data-testid="tab-overview" />
          <Tab label="Tasks" id="project-tab-1" data-testid="tab-tasks" />
          <Tab label="Members" id="project-tab-2" data-testid="tab-members" />
          <Tab label="Time Log" id="project-tab-3" data-testid="tab-timelog" />
          <Tab label="Gantt" id="project-tab-4" data-testid="tab-gantt" />
        </Tabs>

        <ProjectTabPanels
          activeTab={activeTab}
          project={project}
          projectDetails={projectDetails}
          tasks={tasks}
          members={members}
          timeLogs={timeLogs}
          canManageMembers={canManageMembers}
          onCreateTask={handleCreateTask}
          onManageMembers={handleManageMembers}
          onTimeLogCreate={openTimeLogDialog}
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
        onClose={closeTimeLogDialog}
        onSubmit={handleTimeLogSubmit}
        timeLog={selectedTimeLog}
        taskId={timeLogTaskId}
        projectId={id ? Number(id) : undefined}
      />

      {id && canManageMembers && (
        <EditMembersDialog
          open={manageMembersOpen}
          onClose={handleEditMembersDialogClose}
          projectId={Number(id)}
          currentMembers={members}
          onSave={handleMembersUpdate}
        />
      )}
    </Box>
  );
};

export default ProjectDetails;
