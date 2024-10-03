import axios from 'axios';

export const uploadFile = async (fileData) => {
  try {
    const response = await axios.post('localhost:5000/api/files/upload', fileData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
