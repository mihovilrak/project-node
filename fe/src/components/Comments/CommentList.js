import React, { useState, useEffect } from 'react';
import { getCommentsByTask } from '../../api/comments';

const CommentList = ({ taskId }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getCommentsByTask(taskId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [taskId]);

  return (
    <div>
      <ul>
        {comments.map(comment => (
          <li key={comment.id}>
            <p>{comment.name}: {comment.comment}</p>
            <span>{new Date(comment.created_on).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentList;
