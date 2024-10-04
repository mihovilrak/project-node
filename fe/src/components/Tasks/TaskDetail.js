// src/components/Tasks/TaskDetail.js
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../Layout/Layout';

const TaskDetail = () => {
  const { id } = useParams();
  return (
    <Layout>
      <div className="bg-white p-8 shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-6">Task Details for Task {id}</h2>
        {/* Example task detail content */}
        <p>This is the detail view for task {id}.</p>
      </div>
    </Layout>
  );
};

export default TaskDetail;
