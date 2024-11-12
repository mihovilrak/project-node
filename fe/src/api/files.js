import api from './api';

export const getTaskFiles = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}/files`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch files', error);
    throw error;
  }
};

export const uploadFile = async (taskId, formData, onProgress) => {
  try {
    const response = await api.post(`/tasks/${taskId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to upload file', error);
    throw error;
  }
};

export const downloadFile = async (taskId, fileId) => {
  try {
    const response = await api.get(`/tasks/${taskId}/files/${fileId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Failed to download file', error);
    throw error;
  }
};

export const deleteTaskFile = async (taskId, fileId) => {
  try {
    await api.delete(`/tasks/${taskId}/files/${fileId}`);
  } catch (error) {
    console.error('Failed to delete file', error);
    throw error;
  }
}; 