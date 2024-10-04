// src/components/Projects/Projects.js
import React from 'react';
import Layout from '../Layout/Layout';
import { Link } from 'react-router-dom';

const Projects = () => {
  // Sample project data
  const projects = [
    { id: 1, name: 'Project A' },
    { id: 2, name: 'Project B' },
    { id: 3, name: 'Project C' },
  ];

  return (
    <Layout>
      <div className="bg-white p-8 shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-6">Projects</h2>
        <Link to="/projects/create" className="mb-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md">
          Create New Project
        </Link>
        <ul>
          {projects.map((project) => (
            <li key={project.id} className="p-4 border-b hover:bg-gray-100">
              <Link to={`/projects/${project.id}`} className="text-blue-600">
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Projects;
