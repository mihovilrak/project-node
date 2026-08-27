import { useState, useEffect } from 'react';
import { getProjects, getProjectMembers } from '../../api/projects';
import { getProjectTasks } from '../../api/tasks';
import { Project, ProjectMember } from '../../types/project';
import { Task } from '../../types/task';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

export const useProjectSelect = (
  projectId?: number | null,
  taskId?: string | null,
) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [selectError, setSelectError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData);
      } catch (err) {
        logger.error('Error fetching projects:', err);
        setSelectError(getApiErrorMessage(err, 'Failed to load projects'));
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        setProjectMembers([]);
        setProjectTasks([]);
        setSelectError(null);
        return;
      }
      try {
        const membersData = await getProjectMembers(projectId);
        setProjectMembers(membersData);
      } catch (err) {
        logger.error('Error fetching project members:', err);
        setProjectMembers([]);
        setSelectError(getApiErrorMessage(err, 'Failed to load project members'));
      }
      try {
        const tasksData = await getProjectTasks(projectId);
        setProjectTasks(tasksData.filter((task) => task.id !== Number(taskId)));
      } catch (err) {
        logger.error('Failed to fetch project tasks:', err);
        setProjectTasks([]);
        setSelectError(getApiErrorMessage(err, 'Failed to load project tasks'));
      }
    };

    fetchProjectData();
  }, [projectId, taskId]);

  return {
    projects,
    projectMembers,
    projectTasks,
    selectError,
  };
};
