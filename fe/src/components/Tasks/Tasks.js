// src/components/Tasks/Tasks.js
import React from 'react';
import Layout from '../Layout/Layout';
import { Link } from 'react-router-dom';

const Tasks = () => {
  // Sample task data
  const tasks = [
    { id: 1, title: 'Task 1', status: 'In Progress' },
    { id: 2, title: 'Task 2', status: 'Completed' },
    { id: 3, title: 'Task 3', status: 'Pending' },
  ];

  return (
    <Layout>
      <div className="bg-white p-8 shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-6">Tasks</h2>
        <Link to="/tasks/create" className="mb-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md">
          Create New Task
        </Link>
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className="p-4 border-b hover:bg-gray-100 flex justify-between">
              <Link to={`/tasks/${task.id}`} className="text-blue-600">
                {task.title}
              </Link>
              <span className={`text-${task.status === 'Completed' ? 'green' : 'yellow'}-500`}>
                {task.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Tasks;
