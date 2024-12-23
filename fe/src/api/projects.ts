import { api } from './api';
import { Project, ProjectMember } from '../types/project';

// Get all projects
export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Get project by id
export const getProjectById = async (id: number): Promise<Project> => {
  try {
    const response = await api.get(`projects/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

// Get project details
export const getProjectDetails = async (id: number): Promise<Project> => {
  try {
    const response = await api.get(`projects/${id}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project details:', error);
    throw error;
  }
};

// Create project
export const createProject = async (values: Partial<Project>): Promise<Project> => {
  try {
    const response = await api.post('projects', values);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Change project status
export const changeProjectStatus = async (id: number): Promise<Project> => {
  try {
    const response = await api.patch(`projects/${id}/status`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Update project
export const updateProject = async (id: number, updates: Partial<Project>): Promise<Project> => {
  try {
    const response = await api.put(`projects/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Delete project
export const deleteProject = async (id: number): Promise<void> => {
  try {
    await api.delete(`projects/${id}`);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Get project members
export const getProjectMembers = async (id: number): Promise<ProjectMember[]> => {
  try {
    const response = await api.get(`projects/${id}/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project members:', error);
    throw error;
  }
};

// Add project member
export const addProjectMember = async (projectId: number, userId: number): Promise<ProjectMember> => {
  try {
    const response = await api.post(`projects/${projectId}/members`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error adding project member:', error);
    throw error;
  }
};

// Remove project member
export const removeProjectMember = async (projectId: number, userId: number): Promise<void> => {
  try {
    await api.delete(`projects/${projectId}/members`, { data: { userId } });
  } catch (error) {
    console.error('Error removing project member:', error);
    throw error;
  }
};

// Update project member
export const updateProjectMember = async (projectId: number, userId: number, role: string): Promise<ProjectMember> => {
  try {
    const response = await api.put(`projects/${projectId}/members/${userId}`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating project member:', error);
    throw error;
  }
}; 

// Get subprojects
export const getSubprojects = async (projectId: number): Promise<Project[]> => {
    try {
      const response = await api.get(`/projects/${projectId}/subprojects`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subprojects', error);
      throw error;
    }
  };
  
// Create subproject
export const createSubproject = async (projectId: number, subprojectData: Partial<Project>): Promise<Project> => {
  try {
    const response = await api.post(`/projects/${projectId}/subprojects`, subprojectData);
    return response.data;
  } catch (error) {
    console.error('Failed to create subproject', error);
    throw error;
  }
};

// Get project spent time
export const getProjectSpentTime = async (projectId: number): Promise<number> => {
  try {
    const response = await api.get(`/projects/${projectId}/spent-time`);
    return response.data;
  } catch (error) {
    console.error('Failed to get project spent time', error);
    throw error;
  }
};
