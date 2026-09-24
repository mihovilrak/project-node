import { api } from './api';
import { Permission } from '../types/admin';

/**
 * Fetch the full list of permissions from the admin API, using the optional AbortSignal to cancel the request.
 *
 * Performs an HTTP GET to /admin/permissions and returns the response data array; if an AbortSignal is provided the underlying request will be aborted when the signal is triggered.
 * @param signal Optional AbortSignal used to cancel the in-flight HTTP request; passed through to the underlying API client.
 * @returns Promise resolving to an array of Permission objects (each with id, name, and optional created_on) as returned by the server.
 */
export const getAllPermissions = async (
  signal?: AbortSignal,
): Promise<Permission[]> => {
  const response = await api.get<Permission[]>('/admin/permissions', {
    signal,
  });
  return response.data;
};
