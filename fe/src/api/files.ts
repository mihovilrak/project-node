import { api } from './api';
import { TaskFile } from '../types/file';
import { AxiosProgressEvent } from 'axios';

interface FileUploadOptions {
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  params?: Record<string, string>;
}

// Get task files
export const getTaskFiles = async (taskId: number): Promise<TaskFile[]> => {
  try {
    const response = await api.get(`/files`, {
      params: { taskId: taskId.toString() }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch files', error);
    throw error;
  }
};

// Upload file
export const uploadFile = async (
  taskId: number, 
  formData: FormData, 
  onProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<TaskFile> => {
  try {
    const options: FileUploadOptions = {
      onUploadProgress: onProgress,
      params: {
        taskId: taskId.toString()
      }
    };

    const response = await api.post('/files', formData, options);
    return response.data;
  } catch (error) {
    console.error('Failed to upload file', error);
    throw error;
  }
};

// Download file
export const downloadFile = async (taskId: number, fileId: number): Promise<void> => {
  try {
    const response = await api.get(`/files/${fileId}/download`, {
      params: { taskId: taskId.toString() },
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition
      ? decodeURIComponent(contentDisposition.split('filename=')[1].replace(/['"]/g, ''))
      : 'download';
      
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download file', error);
    throw error;
  }
};

// Delete file
export const deleteFile = async (taskId: number, fileId: number): Promise<void> => {
  try {
    await api.delete(`/files/${fileId}`, {
      params: { taskId: taskId.toString() }
    });
  } catch (error) {
    console.error('Failed to delete file', error);
    throw error;
  }
};
