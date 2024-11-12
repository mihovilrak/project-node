import api from './api';

// Fetch all projects
const getProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export { getProjects };

// Fetch a single project by its ID
const getProjectById = async (id) => {
  try {
    const response = await api.get(`projects/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};
export { getProjectById };

// Create a new project
const createProject = async (values) => {
  try {
    const response = await api.post('projects', values);
    console.log('Project successfully created!');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export { createProject };

// Change project status
const changeProjectStatus = async (id) => {
  try {
    const response = await api.patch(`projects/${id}/status`);
    console.log('Project status changed!');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export { changeProjectStatus };

// Update a project
const updateProject = async (id, updates) => {
  try {
    const response = await api.put(`projects/${id}`, updates);
    console.log('Project updated!');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export { updateProject };

// Delete a project
const deleteProject = async (id) => {
  try {
    const response = await api.delete(`projects/${id}`);
    console.log('Project successfully deleted!');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export { deleteProject };

// Fetch project members
export const getProjectMembers = async (id) => {
  try {
    const response = await api.get(`/projects/${id}/members`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project members', error);
    throw error;
  }
};

// Fetch subprojects
export const getSubprojects = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/subprojects`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch subprojects', error);
    throw error;
  }
};

// Create a new subproject
export const createSubproject = async (projectId, subprojectData) => {
  try {
    const response = await api.post(`/projects/${projectId}/subprojects`, subprojectData);
    return response.data;
  } catch (error) {
    console.error('Failed to create subproject', error);
    throw error;
  }
};
