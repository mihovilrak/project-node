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
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

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
      } catch (error: unknown) {
        logger.error('Error fetching task data:', error);
        setState(prev => ({
          ...prev,
          error: getApiErrorMessage(error, 'Failed to load task details'),
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
    } catch (error: unknown) {
      logger.error('Failed to update task status:', error);
      setState(prev => ({
        ...prev,
        error: getApiErrorMessage(error, 'Failed to update task status')
      }));
    }
  };

  const handleDelete = async () => {
    if (!state.task) return;

    try {
      await deleteTask(state.task.id);
      navigate('/tasks');
    } catch (error: unknown) {
      logger.error('Failed to delete task:', error);
      setState(prev => ({
        ...prev,
        error: getApiErrorMessage(error, 'Failed to delete task')
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
