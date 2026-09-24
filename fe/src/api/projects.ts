import { api } from './api';
import { Project, ProjectMember, ProjectStatus } from '../types/project';

/**
 * Fetch the projects list from the server, optionally filtering by status, creator, parent, or start/due date ranges.
 *
 * Performs a GET /projects request and returns the response data as an array of Project objects. If no params are given the endpoint returns all projects (or an empty array). The provided params object is serialized as query parameters. If an AbortSignal is supplied and is triggered the request will be aborted and the returned promise will reject (typically with an AbortError). Date filters should be provided as strings (e.g. ISO or YYYY-MM-DD).
 * @param params Optional filter object with any of: status_id?: number, created_by?: number, parent_id?: number, start_date_from?: string, start_date_to?: string, due_date_from?: string, due_date_to?: string. These are sent as query parameters to the /projects endpoint.
 * @param signal Optional AbortSignal to cancel the HTTP request; if aborted the promise will reject.
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
  const response = await api.get<Project[]>('/projects', {
    params,
    signal,
  });
  return response.data;
};

/**
 * Retrieve the project with the given id from the server.
 *
 * Performs a GET /projects/:id request and returns the primary Project record. The optional AbortSignal can be used to cancel the in-flight request. For expanded or additional project data, use getProjectDetails alongside this call.
 * @param id number - the numeric id of the project to fetch (required)
 * @param signal AbortSignal | undefined - optional signal to cancel the HTTP request
 */
export const getProjectById = async (
  id: number,
  signal?: AbortSignal,
): Promise<Project> => {
  const response = await api.get<Project>(`/projects/${id}`, { signal });
  return response.data;
};

/**
 * Fetch detailed information for a project by id, returning null if the project is not found.
 *
 * Performs an HTTP GET to /projects/{id}/details and returns the response data or null. If the server responds with 404 (project not found) this function returns null; for any other error it rethrows the original error. Accepts an optional AbortSignal to cancel the request. The implementation also guards against falsy response.data and will return null in that case.
 * @param id Numeric project identifier to retrieve details for.
 * @param signal Optional AbortSignal used to cancel the request.
 * @returns Promise resolving to the project's detailed Project object, or null if the project does not exist (HTTP 404) or the response contains no data.
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
 * Send the provided partial Project data to the API to create a new project and return the created Project object.
 *
 * Performs an HTTP POST to /projects with the provided values; the server will assign identifiers, timestamps and any computed fields (for example id, created_on, status_name, spent_time) and return the complete Project object. This function performs a network request and the returned Promise rejects if the request fails.
 * @param values A Partial<Project> containing any subset of Project fields to set on the new project; fields omitted will be filled or defaulted by the server.
 */
export const createProject = async (
  values: Partial<Project>,
): Promise<Project> => {
  const response = await api.post<Project>('/projects', values);
  return response.data;
};

/**
 * Update a project's workflow state by sending the new status identifier to the server.
 *
 * Sends a PATCH request to /projects/{id}/status with a JSON body { status_id: statusId } and returns the backend response message. This operation mutates the project record on the server and will fail if the project or status id does not exist or if the caller lacks permission to change the project's status.
 * @param id Numeric project identifier (project id).
 * @param statusId Numeric identifier of the new project status; sent as status_id in the request body.
 * @returns Promise resolving to an object with a `message` string confirming the status change.
 */
export const changeProjectStatus = async (
  id: number,
  statusId: number,
): Promise<{ message: string }> => {
  const response = await api.patch<{ message: string }>(
    `/projects/${id}/status`,
    {
      status_id: statusId,
    },
  );
  return response.data;
};

// Update project
export const updateProject = async (
  id: number,
  updates: Partial<Project>,
): Promise<Project> => {
  const response = await api.put<Project>(`/projects/${id}`, updates);
  return response.data;
};

/**
 * Delete the project with the given ID on the server.
 *
 * Issues an HTTP DELETE request to /projects/{id} to remove the project resource on the server. The promise resolves with no value once the server confirms deletion; any network or server error will cause the promise to reject.
 * @param id Numeric ID of the project to delete.
 */
export const deleteProject = async (id: number): Promise<void> => {
  await api.delete<void>(`/projects/${id}`);
};

/**
 * Retrieve the members of a project by its numeric ID.
 *
 * Performs a GET request to /projects/{id}/members and returns the list of ProjectMember objects. The optional AbortSignal is forwarded to the underlying request to allow cancellation. If the HTTP response has no data, an empty array is returned (the function never returns null).
 * @param id Numeric ID of the project whose members should be fetched.
 * @param signal Optional AbortSignal to cancel the underlying HTTP request.
 */
export const getProjectMembers = async (
  id: number,
  signal?: AbortSignal,
): Promise<ProjectMember[]> => {
  const response = await api.get<ProjectMember[]>(`/projects/${id}/members`, {
    signal,
  });
  return response.data || [];
};

/**
 * Add a user to the specified project by creating a project member record on the server.
 *
 * Sends a POST request to /projects/{projectId}/members with a JSON body of { userId }. Resolves to the created ProjectMember object and has the side effect of adding that user as a member of the project. projectId and userId are numeric identifiers. The returned ProjectMember includes fields like project_id, user_id, name, surname, role, and created_on.
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
 * Remove a user from a project's membership by issuing a DELETE request for the given project and user IDs.
 *
 * Performs an HTTP DELETE to /projects/{projectId}/members with a request body containing { userId }. The promise resolves when the server confirms removal; the function does not return a value.
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
 * Change the role assigned to a user on a specific project.
 *
 * Performs a PUT request to /projects/{projectId}/members/{userId} with the new role and returns the updated ProjectMember record. This call updates server-side membership data; callers should use the returned ProjectMember or refresh local state. No client-side validation of the role is performed.
 * @param projectId Numeric ID of the project containing the member.
 * @param userId Numeric ID of the user whose project role will be updated.
 * @param role New role string to assign to the project member.
 * @returns Promise<ProjectMember> — resolves to the updated ProjectMember object.
 */
export const updateProjectMember = async (
  projectId: number,
  userId: number,
  role: string,
): Promise<ProjectMember> => {
  const response = await api.put<ProjectMember>(
    `/projects/${projectId}/members/${userId}`,
    { role },
  );
  return response.data;
};

/**
 * Get subprojects for a project by ID from the API.
 *
 * Performs a GET request to /projects/{projectId}/subprojects and returns the immediate child Project objects as an array. The call does not modify server state and will return an empty array if the project has no subprojects. If provided, the AbortSignal is forwarded to the underlying request to allow cancellation.
 * @param projectId Numeric ID of the parent project whose subprojects should be fetched.
 * @param signal Optional AbortSignal to cancel the HTTP request.
 */
export const getSubprojects = async (
  projectId: number,
  signal?: AbortSignal,
): Promise<Project[]> => {
  const response = await api.get<Project[]>(
    `/projects/${projectId}/subprojects`,
    { signal },
  );
  return response.data;
};

/**
 * Retrieve the total time recorded for a project from the API.
 * @param projectId Numeric ID of the project to fetch spent time for
 */
export const getProjectSpentTime = async (
  projectId: number,
): Promise<number> => {
  const response = await api.get<number>(`/projects/${projectId}/spent-time`);
  return response.data;
};

/**
 * Fetch the list of available project statuses from the API.
 *
 * Performs an HTTP GET to '/projects/statuses' and resolves with an array of ProjectStatus objects (each has id, name and optional color). Accepts an optional AbortSignal to cancel the request; if aborted the underlying request may reject.
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
