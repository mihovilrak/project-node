import { AxiosProgressEvent } from 'axios';

export interface FileUploadProps {
  taskId: number;
  onFileUploaded: (file: TaskFile) => void;
}

/**
 * Provide props for a component that renders a list of files for a specific task and handles file deletion events.
 */
export interface FileListProps {
  files: TaskFile[];
  taskId: number;
  onFileDeleted: (fileId: number) => void;
}

/**
 * Represent a task attachment's metadata, including identifiers, filenames, MIME type, size, upload timestamp, and optional uploader name.
 */
export interface TaskFile {
  id: number;
  task_id: number;
  user_id: number;
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  uploaded_on: string;
  // Virtual fields
  uploaded_by?: string;
}

export interface FileUpload {
  task_id: number;
  file: File;
}

/**
 * Provide the properties required by a task-scoped file manager: the task identifier and callbacks to handle file upload and file deletion events.
 */
export interface TaskFilesProps {
  taskId: number;
  onFileUploaded: (file: TaskFile) => void;
  onFileDeleted: (fileId: number) => void;
}

export interface TaskFileSectionProps {
  taskId: number;
  files: TaskFile[];
  onFileUploaded: (file: TaskFile) => void;
  onFileDeleted: (fileId: number) => void;
}

export interface FileUploadOptions {
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  params?: Record<string, string>;
}
