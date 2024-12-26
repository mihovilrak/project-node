import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Task } from '../../types/task';
import { TaskFile } from '../../types/file';
import { getTaskById } from '../../api/tasks';

export const useTaskFileWrapper = () => {
  const handleFileUploaded = (file: TaskFile) => {
    console.log('File uploaded:', file);
  };

  const handleFileDeleted = (fileId: number) => {
    console.log('File deleted:', fileId);
  };

  const taskId = parseInt(window.location.pathname.split('/')[2]);

  return {
    taskId,
    handleFileUploaded,
    handleFileDeleted,
  };
};

export const useTimeLogCalendarWrapper = () => {
  const projectId = parseInt(window.location.pathname.split('/')[2]);
  return { projectId };
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
          console.error('Failed to fetch task:', error);
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
