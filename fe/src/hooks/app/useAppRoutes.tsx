import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Task } from '../../types/task';
import { TaskFile } from '../../types/file';
import { getTaskById } from '../../api/tasks';
import logger from '../../utils/logger';

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

export const useTimeLogCalendarWrapper = () => {
  const { projectId } = useParams<{ projectId: string }>();
  return { projectId: projectId ? parseInt(projectId) : 0 };
};

export const useTaskTimeLogsWrapper = () => {
  const [task, setTask] = useState<Task | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchTask = async () => {
      if (id) {
        try {
          const taskData = await getTaskById(parseInt(id));
          setTask(taskData);
        } catch (error) {
          logger.error('Failed to fetch task:', error);
        }
      }
    };
    fetchTask();
  }, [id]);

  return { task };
};

export const useAppState = () => {
  const [taskFormOpen, setTaskFormOpen] = useState(false);

  const handleTaskCreated = async (task: Task) => {
    setTaskFormOpen(false);
  };

  const handleTaskFormClose = () => {
    setTaskFormOpen(false);
  };

  return {
    taskFormOpen,
    setTaskFormOpen,
    handleTaskCreated,
    handleTaskFormClose,
  };
};
