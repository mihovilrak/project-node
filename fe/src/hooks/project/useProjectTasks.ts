import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types/task';
import { ProjectTasksHook } from '../../types/project';
import { getProjectTasks } from '../../api/tasks';

export const useProjectTasks = (projectId: string): ProjectTasksHook => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const navigate = useNavigate();

  const loadTasks = async () => {
    if (projectId) {
      try {
        const tasks = await getProjectTasks(Number(projectId));
        setTasks(tasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    }
  };

  const handleTaskCreate = async (task: Task): Promise<void> => {
    navigate(`/tasks/new?projectId=${projectId}`);
  };

  return {
    tasks,
    setTasks,
    taskFormOpen,
    setTaskFormOpen,
    handleTaskCreate,
    loadTasks
  };
};
