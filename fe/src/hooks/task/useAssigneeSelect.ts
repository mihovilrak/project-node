import { useState, useEffect } from 'react';
import { getProjectMembers } from '../../api/projects';
import { ProjectMember } from '../../types/project';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

export const useAssigneeSelect = (projectId?: number | null) => {
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (projectId) {
        try {
          setError(null);
          const membersData = await getProjectMembers(projectId);
          setProjectMembers(membersData);
        } catch (err) {
          logger.error('Error fetching project members:', err);
          setError(getApiErrorMessage(err, 'Failed to load project members'));
        }
      }
    };

    fetchProjectMembers();
  }, [projectId]);

  return {
    projectMembers,
    error,
  };
};
