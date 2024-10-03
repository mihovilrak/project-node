import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentList from '../Comments/CommentList';
import AddComment from '../Comments/AddComment';

const TaskDetail = ({ match }) => {
  const [task, setTask] = useState(null);
  const taskId = match.params.id;

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`/api/tasks/${taskId}`);
        setTask(response.data);
      } catch (error) {
        console.error('Error fetching task:', error);
      }
    };

    fetchTask();
  }, [taskId]);

  if (!task) return <p>Loading...</p>;

  return (
    <div>
      <h2>{task.name}</h2>
      <p>{task.description}</p>
      <h3>Comments</h3>
      <CommentList taskId={taskId} />
      <AddComment taskId={taskId} userId={1} /> {/* Assuming logged-in user ID is 1 */}
    </div>
  );
};

export default TaskDetail;
