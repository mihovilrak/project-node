import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Project, ProjectDetailsState } from '../../types/project';
import {
  getProjectById,
  getProjectDetails,
  updateProject,
  deleteProject
} from '../../api/projects';
import { useProjectMembers } from './useProjectMembers';
import { useProjectTasks } from './useProjectTasks';
import { useProjectTimeLogs } from './useProjectTimeLogs';

export const useProjectDetails = (projectId: string) => {
  const [state, setState] = useState<ProjectDetailsState>({
    project: null,
    projectDetails: null,
    members: [],
    tasks: [],
    loading: true,
    error: null,
    editDialogOpen: false,
    deleteDialogOpen: false,
    createTaskDialogOpen: false,
    membersDialogOpen: false,
    timeLogs: []
  });

  const navigate = useNavigate();
  const { currentUser, hasPermission } = useAuth();
  const memberHooks = useProjectMembers(projectId);
  const taskHooks = useProjectTasks(projectId);
  const timeLogHooks = useProjectTimeLogs(projectId);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const [projectData, projectDetails] = await Promise.all([
          getProjectById(Number(projectId)),
          getProjectDetails(Number(projectId))
        ]);

        setState(prev => ({
          ...prev,
          project: projectData,
          projectDetails: projectDetails,
          loading: false
        }));

        // Load data from other hooks
        memberHooks.loadMembers();
        taskHooks.loadTasks();
        timeLogHooks.loadTimeLogs();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to load project details',
          loading: false
        }));
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleProjectUpdate = async (updatedProject: Project) => {
    try {
      await updateProject(Number(projectId), updatedProject);
      setState(prev => ({
        ...prev,
        project: { ...prev.project!, ...updatedProject },
        editDialogOpen: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to update project'
      }));
    }
  };

  const handleProjectDelete = async () => {
    try {
      await deleteProject(Number(projectId));
      navigate('/projects');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to delete project'
      }));
    }
  };

  return {
    ...state,
    ...memberHooks,
    ...taskHooks,
    ...timeLogHooks,
    setState,
    handleProjectUpdate,
    handleProjectDelete,
    isProjectMember: memberHooks.members.some(member => member.user_id === currentUser?.id),
    canEdit: hasPermission('Edit projects'),
    canDelete: hasPermission('Delete projects'),
    canManageMembers: hasPermission('Manage project members')
  };
};
