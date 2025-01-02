import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, TaskStatus, TaskCoreState } from '../../types/task';
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
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to load task details',
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
        task: updatedTask
      }));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDelete = async () => {
    if (!state.task) return;

    try {
      await deleteTask(state.task.id);
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
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
