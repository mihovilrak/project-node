import { api } from './api';
import { User, UserCreate, UserUpdate, UserStatus } from '../types/user';

/**
 * Fetch the list of available user statuses from the server.
 *
 * Performs an HTTP GET to '/users/statuses' and resolves with an array of UserStatus objects (each has id:number, name:string, optional color:string). Accepts an optional AbortSignal to cancel the request. Callers often catch errors and fallback to an empty list when the request fails.
 * @param signal Optional AbortSignal used to cancel the HTTP request to '/users/statuses'.
 */
export const getUserStatuses = async (
  signal?: AbortSignal,
): Promise<UserStatus[]> => {
  const response = await api.get<UserStatus[]>('/users/statuses', { signal });
  return response.data;
};

/**
 * Retrieve a list of users from the server; pass { all: true } in options to include inactive and deleted accounts (for example, in Settings).
 *
 * Performs a GET request to /users and returns the response data array. If whereParams is provided and non-empty it is JSON-stringified and sent as the query parameter whereParams; if options.all is true the query parameter all=1 is included. The optional AbortSignal is forwarded to the underlying request. Empty or undefined whereParams are omitted from the request.
 * @param whereParams Optional filter object (Record<string, any>) that will be JSON-stringified and sent as the query parameter 'whereParams' when non-empty.
 * @param options Optional options object; set { all: true } to include inactive and deleted users (sends query param 'all=1').
 * @param signal Optional AbortSignal to cancel the HTTP request.
 */
export const getUsers = async (
  whereParams?: Record<string, any>,
  options?: { all?: boolean },
  signal?: AbortSignal,
): Promise<User[]> => {
  const params: Record<string, any> = {};

  if (whereParams && Object.keys(whereParams).length > 0) {
    params.whereParams = JSON.stringify(whereParams);
  }
  if (options?.all) {
    params.all = '1';
  }

  const response = await api.get<User[]>('/users', { params, signal });
  return response.data;
};

/**
 * Fetch the user with the given numeric id from the API and return the resolved User object.
 *
 * Performs an HTTP GET request to /users/{id} and returns response.data typed as User. The returned promise rejects on network errors or when the server responds with an error (for example 404 if no user exists for the given id).
 * @param id Numeric user id to fetch; interpolated into the request path (/users/{id}).
 */
export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
};

/**
 * Create a new user by POSTing the given UserCreate payload to /users and return the created User.
 * @param userData UserCreate object with fields: login (string), password (string), name (string), surname (string), email (string), role_id (number), and optional status_id (number).
 */
export const createUser = async (userData: UserCreate): Promise<User> => {
  const response = await api.post<User>('/users', userData);
  return response.data;
};

/**
 * Send an HTTP PUT to update the specified user's fields on the server and return the updated User.
 *
 * Performs a PUT request to /users/{id} with the provided userData and returns the server's updated User object (response.data). Provide only the fields to change in userData; when changing a password include currentPassword alongside password. If userData includes an id field it should correspond to the id argument. This operation performs a network request and can fail for validation, authentication, or authorization reasons from the server.
 * @param id Numeric ID of the user to update; used in the request URL path.
 * @param userData Payload containing fields to update (UserUpdate). Include fields such as login, name, email, role_id, status_id, password and currentPassword when applicable; omit client-only fields like confirmPassword.
 */
export const updateUser = async (
  id: number,
  userData: UserUpdate,
): Promise<User> => {
  const response = await api.put<User>(`/users/${id}`, userData);
  return response.data;
};

/**
 * Delete the user with the given numeric id on the server by sending a DELETE request to /users/{id}.
 *
 * Performs a network DELETE request (via api.delete) to the /users/{id} endpoint and resolves when the server confirms the deletion. The promise resolves with no data; callers should refresh any cached user lists or UI state after a successful deletion. The operation may reject with network or server errors from the underlying request.
 * @param id Numeric ID of the user to delete.
 */
export const deleteUser = async (id: number): Promise<void> => {
  await api.delete<void>(`/users/${id}`);
};

/**
 * Change user status by sending a PATCH request to /users/{id}/status and return the updated User.
 *
 * Sends a PATCH request without a request body to the /users/{id}/status endpoint; the server is expected to update the user's status and respond with the updated User object. The function returns that User wrapped in a Promise and will reject on network or server errors.
 * @param id Numeric ID of the user whose status should be changed.
 */
export const changeUserStatus = async (id: number): Promise<User> => {
  const response = await api.patch<User>(`/users/${id}/status`);
  return response.data;
};
