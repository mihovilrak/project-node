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

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await changeTaskStatus(Number(taskId), newStatus.id);
      setState(prev => ({
        ...prev,
        task: prev.task ? { ...prev.task, status_id: newStatus.id } : null
      }));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(Number(taskId));
      navigate('/tasks');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to delete task'
      }));
    }
  };

  const setSubtasks = (newSubtasks: Task[]) => {
    setState(prev => ({
      ...prev,
      subtasks: newSubtasks
    }));
  };

  return {
    ...state,
    handleStatusChange,
    handleDelete,
    setSubtasks
  };
};
