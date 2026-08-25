import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types/project';
import { getSubprojects } from '../../api/projects';
import logger from '../../utils/logger';

export const useProjectOverview = (projectId: number | undefined) => {
  const navigate = useNavigate();
  const [subprojects, setSubprojects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchSubprojects = async () => {
      if (projectId) {
        try {
          const data = await getSubprojects(projectId);
          setSubprojects(data);
        } catch (error) {
          logger.error('Failed to fetch subprojects:', error);
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
    handleAddSubproject
  };
};
