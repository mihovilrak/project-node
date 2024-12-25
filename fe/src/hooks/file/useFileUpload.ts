import { useState, useRef } from 'react';
import { uploadFile } from '../../api/files';
import { TaskFile } from '../../types/file';
import { AxiosProgressEvent } from 'axios';

export const useFileUpload = (taskId: number, onFileUploaded: (file: TaskFile) => void) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId.toString());

      const progressCallback = (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentage);
        }
      };

      const response = await uploadFile(taskId, formData, progressCallback);

      if (response) {
        onFileUploaded(response);
        setProgress(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return {
    uploading,
    progress,
    error,
    fileInputRef,
    handleFileChange,
    setError
  };
};
