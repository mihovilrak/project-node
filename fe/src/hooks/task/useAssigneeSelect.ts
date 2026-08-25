import { useState, useEffect } from 'react';
import { getProjectMembers } from '../../api/projects';
import { ProjectMember } from '../../types/project';
import logger from '../../utils/logger';

export const useAssigneeSelect = (projectId?: number | null) => {
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (projectId) {
        try {
          const membersData = await getProjectMembers(projectId);
          setProjectMembers(membersData);
        } catch (error) {
          logger.error('Error fetching project members:', error);
        }
      }
    };

    fetchProjectMembers();
  }, [projectId]);

  return {
    projectMembers
  };
};
