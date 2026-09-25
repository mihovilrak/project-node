import { api } from './api';
import { Project, ProjectMember, ProjectStatus } from '../types/project';
import { fetchAllPages } from './pagination';

/**
 * Fetch the projects list from the server, optionally filtering by status,
 * creator, parent, or start/due date ranges.
 *
 * Performs a GET /projects request and returns the response data as an array of
 * Project objects. If no params are given the endpoint returns all projects (or
 * an empty array). The provided params object is serialized as query
 * parameters. If an AbortSignal is supplied and is triggered the request will
 * be aborted and the returned promise will reject (typically with an
 * AbortError). Date filters should be provided as strings (e.g. ISO or
 * YYYY-MM-DD).
 *
 * @param params Optional filter object with any of: status_id?: number,
 *   created_by?: number, parent_id?: number, start_date_from?: string,
 *   start_date_to?: string, due_date_from?: string, due_date_to?: string. These
 *   are sent as query parameters to the /projects endpoint.
 * @param signal Optional AbortSignal to cancel the HTTP request; if aborted the
 *   promise will reject.
 */
export const getProjects = async (
  params?: {
    status_id?: number;
    created_by?: number;
    parent_id?: number;
    start_date_from?: string;
    start_date_to?: string;
    due_date_from?: string;
    due_date_to?: string;
  },
  signal?: AbortSignal,
): Promise<Project[]> => {
  return fetchAllPages(async (page) => {
    const response = await api.get<Project[]>('/projects', {
      params: { ...params, ...page },
      signal,
    });
    return response.data;
  });
};

/**
 * Fetch detailed information for a project by id, returning null if the project
 * is not found.
 *
 * Performs an HTTP GET to /projects/{id}/details and returns the response data
 * or null. If the server responds with 404 (project not found) this function
 * returns null; for any other error it rethrows the original error. Accepts an
 * optional AbortSignal to cancel the request. The implementation also guards
 * against falsy response.data and will return null in that case.
 *
 * @param id Numeric project identifier to retrieve details for.
 * @param signal Optional AbortSignal used to cancel the request.
 * @returns Promise resolving to the project's detailed Project object, or null
 *   if the project does not exist (HTTP 404) or the response contains no data.
 */
export const getProjectDetails = async (
  id: number,
  signal?: AbortSignal,
): Promise<Project | null> => {
  try {
    const response = await api.get<Project>(`/projects/${id}/details`, {
      signal,
    });
    return response.data || null;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Send the provided partial Project data to the API to create a new project and
 * return the created Project object.
 *
 * Performs an HTTP POST to /projects with the provided values; the server will
 * assign identifiers, timestamps and any computed fields (for example id,
 * created_on, status_name, spent_time) and return the complete Project object.
 * This function performs a network request and the returned Promise rejects if
 * the request fails.
 *
 * @param values A Partial<Project> containing any subset of Project fields to
 *   set on the new project; fields omitted will be filled or defaulted by the
 *   server.
 */
export const createProject = async (
  values: Partial<Project>,
): Promise<Project> => {
  const response = await api.post<Project>('/projects', values);
  return response.data;
};

/**
 * Save project changes. The server does not return the updated record, so
 * callers merge `updates` into their local state.
 */
export const updateProject = async (
  id: number,
  updates: Partial<Project>,
): Promise<void> => {
  await api.put(`/projects/${id}`, updates);
};

/**
 * Move a project to another status. PUT /projects/:id ignores status_id, so
 * status changes go through this endpoint.
 *
 * @param id Numeric ID of the project.
 * @param statusId ID of the target project status.
 */
export const changeProjectStatus = async (
  id: number,
  statusId: number,
): Promise<void> => {
  await api.patch(`/projects/${id}/status`, { status_id: statusId });
};

/**
 * Delete the project with the given ID on the server.
 *
 * Issues an HTTP DELETE request to /projects/{id} to remove the project
 * resource on the server. The promise resolves with no value once the server
 * confirms deletion; any network or server error will cause the promise to
 * reject.
 *
 * @param id Numeric ID of the project to delete.
 */
export const deleteProject = async (id: number): Promise<void> => {
  await api.delete<void>(`/projects/${id}`);
};

/**
 * Retrieve the members of a project by its numeric ID.
 *
 * Performs a GET request to /projects/{id}/members and returns the list of
 * ProjectMember objects. The optional AbortSignal is forwarded to the
 * underlying request to allow cancellation. If the HTTP response has no data,
 * an empty array is returned (the function never returns null).
 *
 * @param id Numeric ID of the project whose members should be fetched.
 * @param signal Optional AbortSignal to cancel the underlying HTTP request.
 */
export const getProjectMembers = async (
  id: number,
  signal?: AbortSignal,
): Promise<ProjectMember[]> => {
  return fetchAllPages(async (page) => {
    const response = await api.get<ProjectMember[]>(
      `/projects/${id}/members`,
      { params: page, signal },
    );
    return response.data;
  });
};

/**
 * Add a user to the specified project by creating a project member record on
 * the server.
 *
 * Sends a POST request to /projects/{projectId}/members with a JSON body of {
 * userId }. Resolves to the created ProjectMember object and has the side
 * effect of adding that user as a member of the project. projectId and userId
 * are numeric identifiers. The returned ProjectMember includes fields like
 * project_id, user_id, name, surname, role, and created_on.
 *
 * @param projectId Numeric ID of the project to which the user will be added.
 * @param userId Numeric ID of the user to add as a project member.
 * @returns Promise resolving to the created ProjectMember object.
 */
export const addProjectMember = async (
  projectId: number,
  userId: number,
): Promise<ProjectMember> => {
  const response = await api.post<ProjectMember>(
    `/projects/${projectId}/members`,
    {
      userId,
    },
  );
  return response.data;
};

/**
 * Remove a user from a project's membership by issuing a DELETE request for the
 * given project and user IDs.
 *
 * Performs an HTTP DELETE to /projects/{projectId}/members with a request body
 * containing { userId }. The promise resolves when the server confirms removal;
 * the function does not return a value.
 *
 * @param projectId Numeric ID of the project to remove the member from.
 * @param userId Numeric ID of the user to remove from the project.
 */
export const removeProjectMember = async (
  projectId: number,
  userId: number,
): Promise<void> => {
  await api.delete<void>(`/projects/${projectId}/members`, {
    data: { userId },
  });
};

/**
 * Get subprojects for a project by ID from the API.
 *
 * Performs a GET request to /projects/{projectId}/subprojects and returns the
 * immediate child Project objects as an array. The call does not modify server
 * state and will return an empty array if the project has no subprojects. If
 * provided, the AbortSignal is forwarded to the underlying request to allow
 * cancellation.
 *
 * @param projectId Numeric ID of the parent project whose subprojects should be
 *   fetched.
 * @param signal Optional AbortSignal to cancel the HTTP request.
 */
export const getSubprojects = async (
  projectId: number,
  signal?: AbortSignal,
): Promise<Project[]> => {
  return fetchAllPages(async (page) => {
    const response = await api.get<Project[]>(
      `/projects/${projectId}/subprojects`,
      { params: page, signal },
    );
    return response.data;
  });
};

/**
 * Fetch the list of available project statuses from the API.
 *
 * Performs an HTTP GET to '/projects/statuses' and resolves with an array of
 * ProjectStatus objects (each has id, name and optional color). Accepts an
 * optional AbortSignal to cancel the request; if aborted the underlying request
 * may reject.
 *
 * @param signal Optional AbortSignal to cancel the HTTP request.
 */
export const getProjectStatuses = async (
  signal?: AbortSignal,
): Promise<ProjectStatus[]> => {
  const response = await api.get<ProjectStatus[]>('/projects/statuses', {
    signal,
  });
  return response.data;
};
