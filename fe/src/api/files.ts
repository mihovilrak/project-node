import { api } from './api';
import { TaskFile } from '../types/files';
import { FileUploadOptions } from '../types/api';
import { AxiosProgressEvent } from 'axios';

// Get task files
export const getTaskFiles = async (taskId: number): Promise<TaskFile[]> => {
  try {
    const response = await api.get(`/tasks/${taskId}/files`);
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
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    };

    const response = await api.post(
      `/tasks/${taskId}/files`, 
      formData,
      options
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to upload file', error);
    throw error;
  }
};

// Download file
export const downloadFile = async (taskId: number, fileId: number): Promise<void> => {
  try {
    const response = await api.get(`/tasks/${taskId}/files/${fileId}/download`, {
      responseType: 'blob'
    });
    
    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header or use a default
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
    await api.delete(`/tasks/${taskId}/files/${fileId}`);
  } catch (error) {
    console.error('Failed to delete file', error);
    throw error;
  }
}; 