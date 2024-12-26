import { useState } from 'react';
import { Task } from '../../types/task';
import { ProjectTasksHook } from '../../types/project';
import { getProjectTasks, createTask } from '../../api/tasks';

export const useProjectTasks = (projectId: string): ProjectTasksHook => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskFormOpen, setTaskFormOpen] = useState(false);

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

  const handleTaskCreate = async (task: Task) => {
    try {
      const createdTask = await createTask({ ...task, project_id: Number(projectId) });
      setTasks(prev => [...prev, createdTask]);
      setTaskFormOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
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
