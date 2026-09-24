import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Task } from '../../types/task';
import { TaskFile } from '../../types/file';
import { getTaskById } from '../../api/tasks';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

/**
 * Provide task file management handlers and extract the task ID from route parameters.
 */
export const useTaskFileWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const handleFileUploaded = (file: TaskFile) => {
    logger.info('File uploaded:', file);
  };

  const handleFileDeleted = (fileId: number) => {
    logger.info('File deleted:', fileId);
  };

  const taskId = id ? parseInt(id) : 0;

  return {
    taskId,
    handleFileUploaded,
    handleFileDeleted,
  };
};

/**
 * Extract and parse the project ID from the current route parameters.
 * @returns Object with projectId as a number, or 0 if not present.
 */
export const useTimeLogCalendarWrapper = () => {
  const { projectId } = useParams<{ projectId: string }>();
  return { projectId: projectId ? parseInt(projectId) : 0 };
};

/**
 * Fetch and manage task data for the time logs view.
 */
export const useTaskTimeLogsWrapper = () => {
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const controller = new AbortController();
    const fetchTask = async () => {
      if (id) {
        try {
          setError(null);
          const taskData = await getTaskById(parseInt(id), controller.signal);
          setTask(taskData);
        } catch (err) {
          if (controller.signal.aborted) return;
          logger.error('Failed to fetch task:', err);
          setError(getApiErrorMessage(err, 'Failed to load task'));
        }
      }
    };
    fetchTask();
    return () => controller.abort();
  }, [id]);

  return { task, error };
};
