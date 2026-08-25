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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [activityTypesData] = await Promise.all([
          getActivityTypes()
        ]);
        setActivityTypes(activityTypesData);
      } catch (error) {
        logger.error('Error loading data:', error);
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
        const [projectsData] = await Promise.all([
          getProjects()
        ]);
        setProjects(projectsData);

        if (hasAdminPermission) {
          const usersData = await getUsers();
          setUsers(usersData);
        }

        if (projectId) {
          const projectTasks = await getProjectTasks(projectId);
          setTasks(projectTasks);
        }
      } catch (error) {
        logger.error('Error loading projects and tasks:', error);
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
        const projectTasks = await getProjectTasks(projectId);
        setTasks(projectTasks);
      } catch (error) {
        logger.error('Error loading tasks:', error);
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
    handleProjectSelect,
  };
};
