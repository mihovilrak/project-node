import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, TaskCoreState } from '../../types/task';
import {
  getTaskById,
  getSubtasks,
  getTaskStatuses,
  changeTaskStatus,
  deleteTask
} from '../../api/tasks';

export const useTaskCore = (taskId: string) => {
  const [state, setState] = useState<TaskCoreState>({
    task: null,
    subtasks: [],
    statuses: [],
    loading: true,
    error: null
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskData = async () => {
      if (!taskId) return;

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const [taskData, subtasksData, statusesData] = await Promise.all([
          getTaskById(Number(taskId)),
          getSubtasks(Number(taskId)),
          getTaskStatuses()
        ]);

        setState(prev => ({
          ...prev,
          task: taskData,
          subtasks: subtasksData,
          statuses: statusesData,
          loading: false
        }));
      } catch (error: any) {
        console.error('Error fetching task data:', error);
        const errorMessage = error?.response?.data?.error || 
                           error?.message || 
                           'Failed to load task details';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false
        }));
      }
    };

    fetchTaskData();
  }, [taskId]);

  const handleStatusChange = async (statusId: number) => {
    if (!state.task) return;

    try {
      const updatedTask = await changeTaskStatus(state.task.id, statusId);
      setState(prev => ({
        ...prev,
        task: updatedTask,
        error: null
      }));
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to update task status';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
    }
  };

  const handleDelete = async () => {
    if (!state.task) return;

    try {
      await deleteTask(state.task.id);
      navigate('/tasks');
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to delete task';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
    }
  };

  const setSubtasks = (subtasks: Task[]) => {
    setState(prev => ({ ...prev, subtasks }));
  };

  return {
    ...state,
    handleStatusChange,
    handleDelete,
    setSubtasks
  };
};
