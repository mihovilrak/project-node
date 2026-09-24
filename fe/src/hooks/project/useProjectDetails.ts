import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Project } from '../../types/project';
import { getProjectDetails, deleteProject } from '../../api/projects';
import { useAsyncResource } from '../common/useAsyncResource';
import { useProjectMembers } from './useProjectMembers';
import { useProjectTasks } from './useProjectTasks';
import { useProjectTimeLogs } from './useProjectTimeLogs';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

/**
 * Fetch and manage project details, members, tasks, and time logs with dialog
 * state controls.
 *
 * @param projectId String
 */
export const useProjectDetails = (projectId: string) => {
  const navigate = useNavigate();
  const { currentUser, hasPermission } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: project,
    setData: setProject,
    loading,
    error,
  } = useAsyncResource<Project | null>(
    async (signal) => {
      const details = await getProjectDetails(Number(projectId), signal);
      if (!details) throw new Error('Project not found');
      return { ...details, spent_time: details.spent_time ?? 0 };
    },
    [projectId],
    {
      initialData: null,
      enabled: Boolean(projectId),
      errorMessage: 'Failed to load project details',
    },
  );

  const memberHooks = useProjectMembers(projectId);
  const taskHooks = useProjectTasks(projectId);
  const timeLogHooks = useProjectTimeLogs(projectId);
  const { handleMemberRemove } = memberHooks;
  const { handleTimeLogDelete } = timeLogHooks;

  // ProjectEditDialog already saved the changes; only merge them locally.
  const handleProjectUpdate = useCallback(
    (updatedProject: Project) => {
      setProject((prev) => (prev ? { ...prev, ...updatedProject } : prev));
      setEditDialogOpen(false);
    },
    [setProject],
  );

  const handleProjectDelete = useCallback(async () => {
    try {
      setActionError(null);
      await deleteProject(Number(projectId));
      navigate('/projects');
    } catch (err: unknown) {
      logger.error('Failed to delete project:', err);
      setActionError(getApiErrorMessage(err, 'Failed to delete project'));
    }
  }, [projectId, navigate]);

  const removeMember = useCallback(
    async (userId: number) => {
      try {
        setActionError(null);
        await handleMemberRemove(userId);
      } catch (err: unknown) {
        setActionError(getApiErrorMessage(err, 'Failed to remove member'));
      }
    },
    [handleMemberRemove],
  );

  const deleteTimeLog = useCallback(
    async (timeLogId: number) => {
      try {
        setActionError(null);
        await handleTimeLogDelete(timeLogId);
      } catch (err: unknown) {
        setActionError(getApiErrorMessage(err, 'Failed to delete time log'));
      }
    },
    [handleTimeLogDelete],
  );

  const isProjectMember = useMemo(
    () =>
      memberHooks.members.some((member) => member.user_id === currentUser?.id),
    [memberHooks.members, currentUser?.id],
  );

  const canEdit = hasPermission('Edit projects');
  const canDelete = hasPermission('Delete projects');
  // The members endpoints are guarded by 'Edit projects' on the backend.
  const canManageMembers = canEdit;

  return {
    ...memberHooks,
    ...taskHooks,
    ...timeLogHooks,
    project,
    projectDetails: project,
    loading,
    error,
    actionError,
    setActionError,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleProjectUpdate,
    handleProjectDelete,
    handleMemberRemove: removeMember,
    handleTimeLogDelete: deleteTimeLog,
    isProjectMember,
    canEdit,
    canDelete,
    canManageMembers,
  };
};
