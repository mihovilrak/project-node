import api from './api';

// Fetch all projects
const getProjects = async () => {
    try {
        const response = await api.get('/projects');
        return response.data;
    } catch (error) {
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
        throw error;
    }
};
export { createProject };

// Change project status
const changeProjectStatus = async (id, status) => {
    try {
        const response = await api.patch(`projects/${id}/status`, { status });
        console.log('Project status changed!');
        return response.data;
    } catch (error) {
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
        throw error;
    }
};
export { deleteProject };
