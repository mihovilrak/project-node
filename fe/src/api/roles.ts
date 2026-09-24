import { api } from './api';
import { Role } from '../types/role';

/**
 * Fetch the list of roles from the backend, including each role's permissions.
 *
 * Performs an HTTP GET to '/roles' and returns the server-provided array of Role objects. Each Role may include a permissions field (either Permission[] or number[]). The optional AbortSignal, if provided, is used to cancel the network request; on cancellation the underlying request is aborted and the promise will reject.
 * @param signal Optional AbortSignal to cancel the in-flight request; if the signal is aborted the request is cancelled and the returned promise will reject.
 */
export const getRoles = async (signal?: AbortSignal): Promise<Role[]> => {
  const response = await api.get<Role[]>('/roles', { signal });
  return response.data;
};

/**
 * Create a new role on the server from the provided partial role data.
 *
 * Sends a POST request to /roles with the given role data and returns the Role object returned by the API. The server will typically assign the id and timestamp fields (created_on, updated_on); callers should provide only the fields to set. The permissions field may be an array of Permission objects or an array of permission IDs.
 * @param roleData Partial<Role> containing the fields to set on the new role; omit server-assigned fields like id and created_on/updated_on. permissions may be Permission[] or number[].
 * @returns Promise that resolves to the created Role object as returned by the API (including assigned id and timestamps).
 */
export const createRole = async (roleData: Partial<Role>): Promise<Role> => {
  const response = await api.post<Role>('/roles', roleData);
  return response.data;
};

/**
 * Update an existing Role on the server by sending the provided partial role fields for the role with the given id.
 *
 * Performs an HTTP PUT to /roles/{id} with roleData as the request body and returns the server's updated Role record (response.data). roleData is a Partial<Role> and may include any updatable Role fields (for example name, description, active, permissions as Permission[] or number[]). This operation has the side effect of changing the remote Role; it will fail if the id does not exist or if the caller lacks required permissions. Callers must await the returned promise.
 * @param id Number identifier of the Role to update.
 * @param roleData Partial<Role> containing the fields to change on the Role; omitted fields are not modified.
 */
export const updateRole = async (
  id: number,
  roleData: Partial<Role>,
): Promise<Role> => {
  const response = await api.put<Role>(`/roles/${id}`, roleData);
  return response.data;
};

// Delete role
export const deleteRole = async (id: number): Promise<void> => {
  await api.delete<void>(`/roles/${id}`);
};
