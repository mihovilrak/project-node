import { AxiosProgressEvent } from 'axios';

// Generic API Response wrapper
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
}

// File upload options
export interface FileUploadOptions {
  headers: {
    'Content-Type': string;
  };
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}
