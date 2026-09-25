import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types/task';
import {
  getTaskById,
  getSubtasks,
  changeTaskStatus,
  deleteTask,
} from '../../api/tasks';
import { useLookup } from '../../context/LookupsContext';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

interface TaskCoreData {
  task: Task | null;
  subtasks: Task[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetch and manage task data including subtasks, statuses, and mutations. Load
 * failures go to `error`; failed mutations go to `actionError` so the page
 * stays rendered.
 *
 * @param taskId The numeric task identifier as a string.
 */
export const useTaskCore = (taskId: string) => {
  const [state, setState] = useState<TaskCoreData>({
    task: null,
    subtasks: [],
    loading: true,
    error: null,
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const { data: statuses } = useLookup('statuses');

  const navigate = useNavigate();

  useEffect(() => {
    if (!taskId) return;
    const controller = new AbortController();
    const fetchTaskData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const [taskData, subtasksData] = await Promise.all([
          getTaskById(Number(taskId), controller.signal),
          getSubtasks(Number(taskId), controller.signal),
        ]);

        setState({
          task: taskData,
          subtasks: subtasksData,
          loading: false,
          error: null,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        logger.error('Error fetching task data:', error);
        setState((prev) => ({
          ...prev,
          error: getApiErrorMessage(error, 'Failed to load task details'),
          loading: false,
        }));
      }
    };

    fetchTaskData();
    return () => controller.abort();
  }, [taskId]);

  const handleStatusChange = async (statusId: number) => {
    if (!state.task) return;

    try {
      setActionError(null);
      const updatedTask = await changeTaskStatus(state.task.id, statusId);
      setState((prev) => ({ ...prev, task: updatedTask }));
    } catch (error: unknown) {
      logger.error('Failed to update task status:', error);
      setActionError(getApiErrorMessage(error, 'Failed to update task status'));
    }
  };

  const handleDelete = async () => {
    if (!state.task) return;

    await deleteTask(state.task.id);
    navigate('/tasks');
  };

  const setSubtasks = useCallback((subtasks: Task[]) => {
    setState((prev) => ({ ...prev, subtasks }));
  }, []);

  return {
    ...state,
    statuses,
    actionError,
    setActionError,
    handleStatusChange,
    handleDelete,
    setSubtasks,
  };
};
