import { useState } from 'react';
import { ProjectMember, ProjectMembersHook } from '../../types/project';
import {
  getProjectMembers,
  updateProjectMember,
  removeProjectMember,
  addProjectMember
} from '../../api/projects';

export const useProjectMembers = (projectId: string): ProjectMembersHook => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [manageMembersOpen, setManageMembersOpen] = useState(false);

  const loadMembers = async () => {
    try {
      const membersData = await getProjectMembers(Number(projectId));
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to load members:', error);
      throw error;
    }
  };

  const handleMemberUpdate = async (memberId: number, role: string) => {
    try {
      await updateProjectMember(Number(projectId), memberId, role);
      const updatedMembers = members.map(member =>
        member.user_id === memberId ? { ...member, role } : member
      );
      setMembers(updatedMembers);
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  };

  const handleMemberRemove = async (memberId: number) => {
    try {
      await removeProjectMember(Number(projectId), memberId);
      const updatedMembers = members.filter(member => member.user_id !== memberId);
      setMembers(updatedMembers);
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  };

  const handleMembersUpdate = async (selectedUsers: number[]) => {
    try {
      const membersToRemove = members
        .filter(member => !selectedUsers.includes(member.user_id))
        .map(member => member.user_id);

      const membersToAdd = selectedUsers.filter(
        userId => !members.some(member => member.user_id === userId)
      );

      for (const userId of membersToRemove) {
        await removeProjectMember(Number(projectId), userId);
      }

      for (const userId of membersToAdd) {
        await addProjectMember(Number(projectId), userId);
      }

      await loadMembers();
    } catch (error) {
      console.error('Failed to update members:', error);
      throw error;
    }
  };

  return {
    members,
    setMembers,
    manageMembersOpen,
    setManageMembersOpen,
    handleMemberUpdate,
    handleMemberRemove,
    handleMembersUpdate,
    loadMembers
  };
};
