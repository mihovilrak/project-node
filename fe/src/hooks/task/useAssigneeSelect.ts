import { useState, useEffect } from 'react';
import { getProjectMembers } from '../../api/projects';
import { ProjectMember } from '../../types/project';

export const useAssigneeSelect = (projectId?: number | null) => {
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (projectId) {
        try {
          const membersData = await getProjectMembers(projectId);
          setProjectMembers(membersData);
        } catch (error) {
          console.error('Error fetching project members:', error);
        }
      }
    };

    fetchProjectMembers();
  }, [projectId]);

  return {
    projectMembers
  };
};
