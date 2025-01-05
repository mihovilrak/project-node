import { useState, useEffect, useCallback } from 'react';
import { TaskFile } from '../../types/file';
import { getTaskFiles, uploadFile, deleteFile } from '../../api/files';

export const useTaskFiles = (taskId: string) => {
  const [files, setFiles] = useState<TaskFile[]>([]);

  const refreshFiles = useCallback(async () => {
    try {
      const filesData = await getTaskFiles(Number(taskId));
      setFiles(filesData);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  }, [taskId]);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('task_id', taskId);
      
      const uploadedFile = await uploadFile(Number(taskId), formData);
      await refreshFiles(); // Refresh files after upload
      return uploadedFile;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  };

  const handleFileDelete = async (fileId: number) => {
    try {
      await deleteFile(Number(taskId), fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  };

  return {
    files,
    handleFileUpload,
    handleFileDelete,
    refreshFiles
  };
};
