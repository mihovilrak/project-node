import { api } from './api';
import { User } from '../types/user';
import { Task } from '../types/task';
import { Project } from '../types/project';
import {
  ProfileData,
  ProfileUpdateData,
  PasswordChange,
} from '../types/profile';

/**
 * Retrieve the current user's profile metrics from the API.
 *
 * Performs a GET request to the /profile endpoint and returns the server-provided ProfileData object (response.data) containing total_tasks, completed_tasks, active_projects, and total_hours. The optional AbortSignal can be used to cancel the HTTP request; callers should still guard against missing or falsy response data from the server.
 * @param signal Optional AbortSignal used to cancel the HTTP request.
 */
export const getProfile = async (
  signal?: AbortSignal,
): Promise<ProfileData> => {
  const response = await api.get<ProfileData>('/profile', { signal });
  return response.data;
};

/**
 * Update the user profile on the server by sending the provided profileData and return the updated User.
 *
 * Sends a PUT request to the '/profile' endpoint with profileData as the request body and resolves to the User object returned by the server. This performs a server-side update of the user's persisted profile; callers should handle network or authorization errors and use the returned User to refresh UI state.
 * @param profileData ProfileUpdateData object containing the fields to update; sent as the PUT request body to '/profile'.
 */
export const updateProfile = async (
  profileData: ProfileUpdateData,
): Promise<User> => {
  const response = await api.put<User>('/profile', profileData);
  return response.data;
};

/**
 * Send the current password, new password, and confirmation to the backend to update the authenticated user's account password.
 *
 * Performs an HTTP PUT to '/profile/password' with the supplied PasswordChange object (fields: current_password, new_password, confirm_password). This request causes the server to change the authenticated user's stored credentials; callers should validate that new_password and confirm_password match before calling. The promise resolves when the request completes and does not return a value.
 * @param passwordData Object matching PasswordChange: { current_password: string, new_password: string, confirm_password: string } — the current password, the desired new password, and a confirmation of the new password.
 */
export const changePassword = async (
  passwordData: PasswordChange,
): Promise<void> => {
  await api.put<void>('/profile/password', passwordData);
};

/**
 * Fetch the current user's recent tasks from the API.
 *
 * Performs an HTTP GET to /profile/tasks. The request can be canceled by passing an AbortSignal; otherwise it resolves with the full list of recent Task objects returned by the server.
 * @param signal Optional AbortSignal to cancel the in-flight request; if aborted the underlying fetch will be terminated.
 */
export const getRecentTasks = async (signal?: AbortSignal): Promise<Task[]> => {
  const response = await api.get<Task[]>('/profile/tasks', { signal });
  return response.data;
};

// Get recent projects
export const getRecentProjects = async (
  signal?: AbortSignal,
): Promise<Project[]> => {
  const response = await api.get<Project[]>('/profile/projects', { signal });
  return response.data;
};
