import { useState, useEffect } from 'react';
import {
  getProjects,
  getProjectMembers
} from '../../api/projects';
import { getProjectTasks } from '../../api/tasks';
import {
  Project,
  ProjectMember
} from '../../types/project';
import { Task } from '../../types/task';
import logger from '../../utils/logger';

export const useProjectSelect = (projectId?: number | null, taskId?: string | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData);
      } catch (error) {
        logger.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        setProjectMembers([]);
        setProjectTasks([]);
        return;
      }
      try {
        const membersData = await getProjectMembers(projectId);
        setProjectMembers(membersData);
      } catch (error) {
        logger.error('Error fetching project members:', error);
        setProjectMembers([]);
      }
      try {
        const tasksData = await getProjectTasks(projectId);
        setProjectTasks(tasksData.filter(task => task.id !== Number(taskId)));
      } catch (error) {
        logger.error('Failed to fetch project tasks:', error);
        setProjectTasks([]);
      }
    };

    fetchProjectData();
  }, [projectId, taskId]);

  return {
    projects,
    projectMembers,
    projectTasks
  };
};
