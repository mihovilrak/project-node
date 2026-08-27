import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types/task';
import { ProjectTasksHook } from '../../types/project';
import { getProjectTasks } from '../../api/tasks';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

export const useProjectTasks = (projectId: string): ProjectTasksHook => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadTasks = async () => {
    if (projectId) {
      try {
        setTasksError(null);
        const tasks = await getProjectTasks(Number(projectId));
        setTasks(tasks || []);
      } catch (err: unknown) {
        logger.error('Failed to load tasks:', err);
        setTasks([]);
        setTasksError(getApiErrorMessage(err, 'Failed to load project tasks'));
      }
    }
  };

  const handleTaskCreate = async (task: Task): Promise<void> => {
    navigate(`/tasks/new?projectId=${projectId}`);
  };

  return {
    tasks,
    setTasks,
    tasksError,
    taskFormOpen,
    setTaskFormOpen,
    handleTaskCreate,
    loadTasks,
  };
};
