// src/components/Projects/ProjectDetail.js
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../Layout/Layout';

const ProjectDetail = () => {
  const { id } = useParams();
  return (
    <Layout>
      <div className="bg-white p-8 shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-6">Project Details for Project {id}</h2>
        {/* Example project detail content */}
        <p>This is the detail view for project {id}.</p>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
