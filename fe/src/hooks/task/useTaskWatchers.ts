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
    if (!taskId) return;
    try {
      const watcherData = await getTaskWatchers(Number(taskId));
      setWatchers(watcherData || []);
    } catch (error: any) {
      console.error('Failed to fetch watchers:', error);
      setWatchers([]);
    }
  };

  useEffect(() => {
    fetchWatchers();
  }, [taskId]);

  const handleAddWatcher = async (userId: number) => {
    try {
      if (!taskId) throw new Error('Task ID is required');
      if (!userId) throw new Error('User ID is required');

      await addTaskWatcher(Number(taskId), userId);
      await fetchWatchers();
    } catch (error: any) {
      console.error('Failed to add watcher:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to add watcher';
      throw new Error(errorMessage);
    }
  };

  const handleRemoveWatcher = async (userId: number) => {
    try {
      if (!taskId) throw new Error('Task ID is required');
      if (!userId) throw new Error('User ID is required');

      await removeTaskWatcher(Number(taskId), userId);
      await fetchWatchers();
    } catch (error: any) {
      console.error('Failed to remove watcher:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to remove watcher';
      throw new Error(errorMessage);
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
