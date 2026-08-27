import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types/project';
import { getSubprojects } from '../../api/projects';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

export const useProjectOverview = (projectId: number | undefined) => {
  const navigate = useNavigate();
  const [subprojects, setSubprojects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubprojects = async () => {
      if (projectId) {
        try {
          setError(null);
          const data = await getSubprojects(projectId);
          setSubprojects(data);
        } catch (err) {
          logger.error('Failed to fetch subprojects:', err);
          setError(getApiErrorMessage(err, 'Failed to load subprojects'));
        }
      }
    };
    fetchSubprojects();
  }, [projectId]);

  const handleAddSubproject = () => {
    if (projectId) {
      navigate(`/projects/new?parentId=${projectId}`);
    }
  };

  return {
    subprojects,
    error,
    handleAddSubproject,
  };
};
