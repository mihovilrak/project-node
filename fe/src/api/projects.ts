import { api } from './api';
import { Project, ProjectMember, ProjectStatus } from '../types/project';
import logger from '../utils/logger';

// Get all projects
export const getProjects = async (params?: {
  status_id?: number;
  created_by?: number;
  parent_id?: number;
  start_date_from?: string;
  start_date_to?: string;
  due_date_from?: string;
  due_date_to?: string;
}): Promise<Project[]> => {
  try {
    const response = await api.get('/projects', {
      params
    });
    return response.data;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

// Get project by id
export const getProjectById = async (id: number): Promise<Project> => {
  try {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    logger.error('Error fetching project:', error);
    throw error;
  }
};

// Get project details
export const getProjectDetails = async (id: number): Promise<Project | null> => {
  try {
    const response = await api.get(`/projects/${id}/details`);
    return response.data || null;
  } catch (error: unknown) {
    logger.error('Error fetching project details:', error);
    // Return null if project not found (404), throw for other errors
    const err = error as { response?: { status?: number } };
    if (err?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Create project
export const createProject = async (values: Partial<Project>): Promise<Project> => {
  try {
    const response = await api.post('/projects', values);
    return response.data;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

// Change project status
export const changeProjectStatus = async (id: number): Promise<Project> => {
  try {
    const response = await api.patch(`/projects/${id}/status`);
    return response.data;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

// Update project
export const updateProject = async (id: number, updates: Partial<Project>): Promise<Project> => {
  try {
    const response = await api.put(`/projects/${id}`, updates);
    return response.data;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

// Delete project
export const deleteProject = async (id: number): Promise<void> => {
  try {
    await api.delete(`/projects/${id}`);
  } catch (error) {
    logger.error('Error deleting project:', error);
    throw error;
  }
};

// Get project members
export const getProjectMembers = async (id: number): Promise<ProjectMember[]> => {
  try {
    const response = await api.get(`/projects/${id}/members`);
    return response.data || [];
  } catch (error) {
    logger.error('Error fetching project members:', error);
    throw error;
  }
};

// Add project member
export const addProjectMember = async (projectId: number, userId: number): Promise<ProjectMember> => {
  try {
    const response = await api.post(`/projects/${projectId}/members`, { userId });
    return response.data;
  } catch (error) {
    logger.error('Error adding project member:', error);
    throw error;
  }
};

// Remove project member
export const removeProjectMember = async (projectId: number, userId: number): Promise<void> => {
  try {
    await api.delete(`/projects/${projectId}/members`, { data: { userId } });
  } catch (error) {
    logger.error('Error removing project member:', error);
    throw error;
  }
};

// Update project member
export const updateProjectMember = async (projectId: number, userId: number, role: string): Promise<ProjectMember> => {
  try {
    const response = await api.put(`/projects/${projectId}/members/${userId}`, { role });
    return response.data;
  } catch (error) {
    logger.error('Error updating project member:', error);
    throw error;
  }
};

// Get subprojects
export const getSubprojects = async (projectId: number): Promise<Project[]> => {
  try {
    const response = await api.get(`/projects/${projectId}/subprojects`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch subprojects', error);
    throw error;
  }
};

// Get project spent time
export const getProjectSpentTime = async (projectId: number): Promise<number> => {
  try {
    const response = await api.get(`/projects/${projectId}/spent-time`);
    return response.data;
  } catch (error) {
    logger.error('Failed to get project spent time', error);
    throw error;
  }
};

// Get project statuses
export const getProjectStatuses = async (): Promise<ProjectStatus[]> => {
  try {
    const response = await api.get('/projects/statuses');
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch project statuses', error);
    throw error;
  }
};
