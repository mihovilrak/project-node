import { api } from './api';
import { ActivityType } from '../types/setting';

/**
 * Fetch the list of activity types from the admin API.
 *
 * Performs a GET request to /admin/activity-types and returns the array of ActivityType objects from the response. If an AbortSignal is provided the underlying HTTP request will be cancelled when the signal is aborted.
 * @param signal Optional AbortSignal used to cancel the HTTP request.
 */
export const getActivityTypes = async (
  signal?: AbortSignal,
): Promise<ActivityType[]> => {
  const response = await api.get<ActivityType[]>('/admin/activity-types', {
    signal,
  });
  return response.data;
};

/**
 * Create a new activity type by POSTing the provided partial ActivityType to the admin API and return the created resource.
 *
 * Performs an HTTP POST to '/admin/activity-types'; the server persists the resource and typically assigns an id and timestamps (created_on/updated_on). Fields omitted from the Partial<ActivityType> may be filled or defaulted by the server; the resolved Promise yields the full ActivityType as stored.
 * @param data Partial<ActivityType> containing fields to set for the new activity type (commonly name, color, optional icon and description, and active). Missing fields may be populated by the server.
 */
export const createActivityType = async (
  data: Partial<ActivityType>,
): Promise<ActivityType> => {
  const response = await api.post<ActivityType>('/admin/activity-types', data);
  return response.data;
};

/**
 * Update an activity type on the server by sending the provided partial fields to modify its stored properties.
 *
 * Sends a PUT request to /admin/activity-types/{id} with the supplied partial ActivityType data and returns the server's updated ActivityType representation; the call mutates server state and expects the id to refer to an existing activity type.
 * @param id Numeric ID of the activity type to update on the server.
 * @param data Partial<ActivityType> containing one or more fields to change; only provided fields are sent in the PUT request.
 * @returns Promise that resolves to the updated ActivityType returned by the server.
 */
export const updateActivityType = async (
  id: number,
  data: Partial<ActivityType>,
): Promise<ActivityType> => {
  const response = await api.put<ActivityType>(
    `/admin/activity-types/${id}`,
    data,
  );
  return response.data;
};

/**
 * Delete the activity type on the server by sending a DELETE request to the /admin/activity-types/:id endpoint.
 *
 * Issues an HTTP DELETE to /admin/activity-types/{id}; this removes the activity type resource on the server. The endpoint is under /admin and typically requires appropriate (e.g. administrative) permissions. The operation performs a network request and can fail for reasons such as lack of authorization, the id not existing, or network errors.
 * @param id Server-side numeric identifier of the activity type to delete; placed into the request path (/admin/activity-types/{id}).
 */
export const deleteActivityType = async (id: number): Promise<void> => {
  await api.delete<void>(`/admin/activity-types/${id}`);
};

/**
 * Fetch the list of available icon identifiers for activity types from the server.
 *
 * Performs an HTTP GET to /admin/activity-types/icons and returns the server-provided array of icon names; the optional AbortSignal can cancel the network request. The result may be an empty array if no icons are available.
 * @param signal Optional AbortSignal to cancel the HTTP request
 */
export const getAvailableIcons = async (
  signal?: AbortSignal,
): Promise<string[]> => {
  const response = await api.get<string[]>('/admin/activity-types/icons', {
    signal,
  });
  return response.data;
};
