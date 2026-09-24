import { api } from './api';
import { TaskFile, FileUploadOptions } from '../types/file';
import { AxiosProgressEvent } from 'axios';

/**
 * Fetch the files attached to a specific task from the server.
 *
 * Performs a GET request to /files with the taskId provided as a string query parameter ({ params: { taskId: taskId.toString() } }). The optional AbortSignal is forwarded to the HTTP client to allow request cancellation. Resolves with response.data containing an array of TaskFile objects as returned by the server.
 * @param taskId number — ID of the task to fetch files for; sent as the 'taskId' query parameter (stringified).
 * @param signal AbortSignal | undefined — optional AbortSignal to cancel the request; passed through to the HTTP client.
 */
export const getTaskFiles = async (
  taskId: number,
  signal?: AbortSignal,
): Promise<TaskFile[]> => {
  const response = await api.get<TaskFile[]>(`/files`, {
    params: { taskId: taskId.toString() },
    signal,
  });
  return response.data;
};

/**
 * Upload a file for a task by POSTing multipart form data to /files and return the created TaskFile.
 *
 * Sends an HTTP POST to '/files' with the provided FormData. The request sets request params.taskId to taskId.toString() and forwards the optional onProgress callback to Axios' onUploadProgress option so callers receive upload progress events. The promise resolves with the TaskFile returned by the server. FormData should contain the file payload (callers in this codebase also append 'task_id' into the form data, but the taskId is always included as a query parameter).
 * @param taskId number — numeric ID of the task to associate the uploaded file with; sent as a request parameter (stringified).
 * @param formData FormData — multipart form data containing the file(s) and any other upload fields.
 * @param onProgress (progressEvent: AxiosProgressEvent) => void | undefined — optional callback invoked with Axios progress events during upload; mapped to Axios' onUploadProgress.
 */
export const uploadFile = async (
  taskId: number,
  formData: FormData,
  onProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<TaskFile> => {
  const options: FileUploadOptions = {
    onUploadProgress: onProgress,
    params: {
      taskId: taskId.toString(),
    },
  };

  const response = await api.post<TaskFile>('/files', formData, options);
  return response.data;
};

/**
 * Fetch the file blob for the given task and file IDs from the server and trigger a browser download using the filename from the response's Content-Disposition header (falls back to 'download').
 *
 * Performs an HTTP GET to /files/{fileId}/download with taskId as a query parameter and responseType 'blob'. It creates an object URL from the returned Blob, inserts a temporary anchor element with its download attribute set to the filename extracted from the Content-Disposition header (quotes removed and decoded with decodeURIComponent), clicks the anchor to start the download, removes the anchor, and revokes the object URL. Runs in a browser environment (uses window and document); there is no cancellation support and the Promise resolves once the download has been initiated. If the Content-Disposition header is absent or malformatted, the filename defaults to 'download'.
 * @param taskId Numeric task identifier; converted to string and sent as the 'taskId' query parameter.
 * @param fileId Numeric file identifier used in the request path /files/{fileId}/download.
 */
export const downloadFile = async (
  taskId: number,
  fileId: number,
): Promise<void> => {
  const response = await api.get<Blob>(`/files/${fileId}/download`, {
    params: { taskId: taskId.toString() },
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;

  const contentDisposition = response.headers['content-disposition'];
  const filename = contentDisposition
    ? decodeURIComponent(
        contentDisposition.split('filename=')[1].replace(/['"]/g, ''),
      )
    : 'download';

  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Delete a file on the server for a given task by issuing a DELETE to /files/{fileId} with taskId provided as a query parameter.
 *
 * Sends an HTTP DELETE to /files/:fileId and includes the taskId as a query parameter (params: { taskId }). Both taskId and fileId are required; callers should ensure fileId is present before calling. The promise resolves when the server confirms deletion; the function does not return a value.
 * @param taskId number — ID of the task the file belongs to
 * @param fileId number — ID of the file to delete
 */
export const deleteFile = async (
  taskId: number,
  fileId: number,
): Promise<void> => {
  await api.delete<void>(`/files/${fileId}`, {
    params: { taskId: taskId.toString() },
  });
};
