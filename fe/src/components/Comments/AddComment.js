import React, { useState } from 'react';
import axios from 'axios';

const AddComment = ({ taskId, userId }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/comments', { task_id: taskId, user_id: userId, comment });
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." />
      <button type="submit">Submit</button>
    </form>
  );
};

export default AddComment;
