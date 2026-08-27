import { useState, useEffect } from 'react';
import { Project } from '../../types/project';
import { Task } from '../../types/task';
import { User } from '../../types/user';
import { ActivityType, UseTimeLogDataProps } from '../../types/timeLog';
import { getProjects } from '../../api/projects';
import { getProjectTasks } from '../../api/tasks';
import { getUsers } from '../../api/users';
import { getActivityTypes } from '../../api/activityTypes';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

export const useTimeLogData = ({
  open,
  projectId,
  hasAdminPermission,
}: UseTimeLogDataProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [activityTypesData] = await Promise.all([getActivityTypes()]);
        setActivityTypes(activityTypesData);
      } catch (err) {
        logger.error('Error loading data:', err);
        setLoadError(getApiErrorMessage(err, 'Failed to load activity types'));
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadInitialData();
    }
  }, [open]);

  useEffect(() => {
    const loadProjectsAndTasks = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [projectsData] = await Promise.all([getProjects()]);
        setProjects(projectsData);

        if (hasAdminPermission) {
          const usersData = await getUsers();
          setUsers(usersData);
        }

        if (projectId) {
          const projectTasks = await getProjectTasks(projectId);
          setTasks(projectTasks);
        }
      } catch (err) {
        logger.error('Error loading projects and tasks:', err);
        setLoadError(getApiErrorMessage(err, 'Failed to load projects and tasks'));
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectsAndTasks();
  }, [projectId, hasAdminPermission]);

  const handleProjectSelect = async (projectId: number | null) => {
    if (projectId !== null) {
      setIsLoading(true);
      try {
        setLoadError(null);
        const projectTasks = await getProjectTasks(projectId);
        setTasks(projectTasks);
      } catch (err) {
        logger.error('Error loading tasks:', err);
        setLoadError(getApiErrorMessage(err, 'Failed to load tasks'));
      } finally {
        setIsLoading(false);
      }
    } else {
      setTasks([]);
    }
  };

  return {
    projects,
    tasks,
    users,
    activityTypes,
    isLoading,
    loadError,
    handleProjectSelect,
  };
};
