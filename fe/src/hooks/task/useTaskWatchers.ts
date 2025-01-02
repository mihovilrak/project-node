import { useState, useEffect } from 'react';
import { TaskWatcher } from '../../types/watcher';
import {
  getTaskWatchers,
  addTaskWatcher,
  removeTaskWatcher
} from '../../api/watchers';

export const useTaskWatchers = (taskId: string) => {
  const [watchers, setWatchers] = useState<TaskWatcher[]>([]);

  const fetchWatchers = async () => {
    try {
      const watcherData = await getTaskWatchers(Number(taskId));
      setWatchers(watcherData);
    } catch (error) {
      console.error('Failed to fetch watchers:', error);
    }
  };

  useEffect(() => {
    fetchWatchers();
  }, [taskId]);

  const handleAddWatcher = async (userId: number) => {
    try {
      await addTaskWatcher(Number(taskId), userId);
      await fetchWatchers();
    } catch (error) {
      console.error('Failed to add watcher:', error);
      throw error;
    }
  };

  const handleRemoveWatcher = async (userId: number) => {
    try {
      await removeTaskWatcher(Number(taskId), userId);
      await fetchWatchers();
    } catch (error) {
      console.error('Failed to remove watcher:', error);
      throw error;
    }
  };

  return {
    watchers,
    setWatchers,
    handleAddWatcher,
    handleRemoveWatcher,
    fetchWatchers
  };
};
