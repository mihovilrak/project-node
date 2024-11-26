export interface FileUploadProps {
  taskId: number;
  onFileUploaded: (file: TaskFile) => void;
}

export interface FileListProps {
  files: TaskFile[];
  taskId: number;
  onFileDeleted: (fileId: number) => void;
}

export interface ExtendedTaskFile extends TaskFile {
  original_name: string;
  created_on: string;
}

export interface TaskFile {
  id: number;
  task_id: number;
  user_id: number;
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_on: string;
  // Virtual fields
  uploaded_by?: string;
  user_avatar?: string;
}

export interface FileUpload {
  task_id: number;
  file: File;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileDownload {
  data: Blob;
  filename: string;
  mime_type: string;
}

export interface FileFilters {
  task_id?: number;
  user_id?: number;
  mime_type?: string;
  from_date?: string;
  to_date?: string;
}

export interface FileStats {
  total_files: number;
  total_size: number;
  by_type: FileTypeStats[];
}

interface FileTypeStats {
  mime_type: string;
  count: number;
  total_size: number;
}

export interface FileError {
  error: string;
  details?: string;
}

export interface UploadResponse {
  id: number;
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_on: string;
  uploaded_by: string;
} 