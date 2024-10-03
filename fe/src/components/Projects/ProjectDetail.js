import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from '../Tasks/TaskList';

const ProjectDetail = ({ match }) => {
  const [project, setProject] = useState(null);
  const projectId = match.params.id;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [projectId]);

  if (!project) return <p>Loading...</p>;

  return (
    <div>
      <h2>{project.name}</h2>
      <p>{project.description}</p>
      <h3>Tasks</h3>
      <TaskList projectId={projectId} />
    </div>
  );
};

export default ProjectDetail;
