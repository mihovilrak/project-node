import { useState } from 'react';
import { Task } from '../types/task';
import { getTasksByDateRange } from '../api/tasks';

export const useCalendar = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTasks = async (start: Date, end: Date): Promise<void> => {
    try {
      setLoading(true);
      const tasksData = await getTasksByDateRange(start, end);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    fetchTasks
  };
}; 