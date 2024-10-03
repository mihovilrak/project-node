import axios from 'axios';

export const getCommentsByTask = async (taskId) => {
  try {
    const response = await axios.get(`localhost:5000/api/comments/task/${taskId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addComment = async (commentData) => {
  try {
    const response = await axios.post('/api/comments', commentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
