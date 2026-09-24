import { useCallback, useState } from 'react';
import { ProjectMember, ProjectMembersHook } from '../../types/project';
import {
  getProjectMembers,
  removeProjectMember,
  addProjectMember,
} from '../../api/projects';
import { useAsyncResource } from '../common/useAsyncResource';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const EMPTY_MEMBERS: ProjectMember[] = [];

/**
 * Load project members and add or remove them.
 *
 * @param projectId String identifier for the project
 */
export const useProjectMembers = (projectId: string): ProjectMembersHook => {
  const {
    data: members,
    setData: setMembers,
    error,
    refetch,
  } = useAsyncResource<ProjectMember[]>(
    async (signal) =>
      (await getProjectMembers(Number(projectId), signal)) || [],
    [projectId],
    {
      initialData: EMPTY_MEMBERS,
      enabled: Boolean(projectId),
      errorMessage: 'Failed to load members',
    },
  );
  const [manageMembersOpen, setManageMembersOpen] = useState(false);

  const handleMemberRemove = useCallback(
    async (memberId: number) => {
      try {
        await removeProjectMember(Number(projectId), memberId);
        setMembers((prev) =>
          prev.filter((member) => member.user_id !== memberId),
        );
      } catch (err: unknown) {
        logger.error('Failed to remove member:', err);
        throw new Error(getApiErrorMessage(err, 'Failed to remove member'));
      }
    },
    [projectId, setMembers],
  );

  const handleMembersUpdate = useCallback(
    async (selectedUsers: number[]) => {
      const toRemove = members
        .filter((member) => !selectedUsers.includes(member.user_id))
        .map((member) => member.user_id);
      const toAdd = selectedUsers.filter(
        (userId) => !members.some((member) => member.user_id === userId),
      );
      if (!toRemove.length && !toAdd.length) return;
      try {
        await Promise.all([
          ...toRemove.map((userId) =>
            removeProjectMember(Number(projectId), userId),
          ),
          ...toAdd.map((userId) => addProjectMember(Number(projectId), userId)),
        ]);
      } catch (err: unknown) {
        logger.error('Failed to update members:', err);
        throw new Error(
          getApiErrorMessage(err, 'Failed to update project members'),
        );
      } finally {
        // Some requests may have succeeded even if another failed.
        await refetch();
      }
    },
    [members, projectId, refetch],
  );

  return {
    members,
    membersError: error,
    manageMembersOpen,
    setManageMembersOpen,
    handleMemberRemove,
    handleMembersUpdate,
    loadMembers: refetch,
  };
};
