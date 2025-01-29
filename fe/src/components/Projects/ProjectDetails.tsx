import React, { useState } from 'react';
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

  const handleCreateTask = () => {
    navigate(`/tasks/new?projectId=${id}`);
    setTaskFormOpen(false);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!project) return <Alert severity="error">Project not found</Alert>;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            {project.name}
          </Typography>
          <ProjectActions
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={() => setState(prev => ({ ...prev, editDialogOpen: true }))}
            onDelete={() => setState(prev => ({ ...prev, deleteDialogOpen: true }))}
          />
        </Box>

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Tasks" />
          <Tab label="Members" />
          <Tab label="Time Log" />
          <Tab label="Gantt" />
        </Tabs>

        <ProjectTabPanels
          activeTab={activeTab}
          project={project}
          projectDetails={projectDetails}
          tasks={tasks}
          members={members}
          timeLogs={timeLogs}
          canManageMembers={canManageMembers}
          projectId={id!}
          onCreateTask={handleCreateTask}
          onManageMembers={() => setManageMembersOpen(true)}
          onTimeLogCreate={() => {
            setSelectedTimeLog(null);
            setTimeLogDialogOpen(true);
          }}
          onTimeLogEdit={handleTimeLogEdit}
          onTimeLogDelete={handleTimeLogDelete}
          onMemberRemove={handleMemberRemove}
        />
      </Paper>

      <ProjectEditDialog
        open={editDialogOpen}
        project={project}
        onClose={() => setState(prev => ({ ...prev, editDialogOpen: false }))}
        onSaved={handleProjectUpdate}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Project"
        content="Are you sure you want to delete this project? This action cannot be undone."
        onClose={() => setState(prev => ({ ...prev, deleteDialogOpen: false }))}
        onConfirm={handleProjectDelete}
      />

      <TimeLogDialog
        open={timeLogDialogOpen}
        onClose={() => {
          setTimeLogDialogOpen(false);
          setSelectedTimeLog(null);
        }}
        onSubmit={handleTimeLogSubmit}
        timeLog={selectedTimeLog}
        projectId={Number(id)}
      />

      <EditMembersDialog
        open={manageMembersOpen}
        onClose={() => setManageMembersOpen(false)}
        projectId={Number(id)}
        currentMembers={members}
        onSave={handleMembersUpdate}
      />
    </Box>
  );
};

export default ProjectDetails;
