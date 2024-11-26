import { AxiosError, AxiosProgressEvent, AxiosRequestConfig, AxiosResponse } from 'axios';

// Generic API Response wrapper
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
}

// Generic API Error
export interface ApiError {
    error: string;
    details?: string;
    status?: number;
    validation_errors?: ValidationError[];
}

// Validation error structure
export interface ValidationError {
    field: string;
    message: string;
}

// File upload options
export interface FileUploadOptions {
  headers: {
    'Content-Type': string;
  };
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}

// API request options
export interface ApiRequestOptions extends AxiosRequestConfig {
    secure?: boolean;        // Requires authentication
    handleError?: boolean;   // Auto-handle errors
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

// Query parameters interface
export interface QueryParams {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, string | number | boolean>;
}

// Custom error handler type
export type ErrorHandler = (error: AxiosError<ApiError>) => void;

// Success handler type
export type SuccessHandler = (response: AxiosResponse) => void;

// API method types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Common response messages
export enum ApiMessage {
    CREATED = 'Resource created successfully',
    UPDATED = 'Resource updated successfully',
    DELETED = 'Resource deleted successfully',
    INVALID_REQUEST = 'Invalid request',
    UNAUTHORIZED = 'Unauthorized access',
    FORBIDDEN = 'Access forbidden',
    NOT_FOUND = 'Resource not found',
    SERVER_ERROR = 'Internal server error'
}

// Complete API endpoints configuration
export interface ApiEndpoints {
    readonly BASE_URL: string;
    readonly AUTH: {
        LOGIN: string;
        LOGOUT: string;
        SESSION: string;
        PASSWORD_CHANGE: string;
    };
    readonly USERS: {
        BASE: string;
        BY_ID: (id: number) => string;
        PROFILE: string;
        SETTINGS: string;
        AVATAR: string;
        PERMISSIONS: (id: number) => string;
        TASKS: (id: number) => string;
        TIME_LOGS: (id: number) => string;
        NOTIFICATIONS: (id: number) => string;
    };
    readonly PROJECTS: {
        BASE: string;
        BY_ID: (id: number) => string;
        MEMBERS: (id: number) => string;
        TASKS: (id: number) => string;
        STATS: (id: number) => string;
        TIME_LOGS: (id: number) => string;
        FILES: (id: number) => string;
    };
    readonly TASKS: {
        BASE: string;
        BY_ID: (id: number) => string;
        COMMENTS: (id: number) => string;
        FILES: (id: number) => string;
        TIME_LOGS: (id: number) => string;
        SUBTASKS: (id: number) => string;
        TAGS: (id: number) => string;
        WATCHERS: (id: number) => string;
    };
    readonly COMMENTS: {
        BASE: string;
        BY_ID: (id: number) => string;
    };
    readonly TIME_LOGS: {
        BASE: string;
        BY_ID: (id: number) => string;
        STATS: string;
    };
    readonly FILES: {
        BASE: string;
        BY_ID: (id: number) => string;
        DOWNLOAD: (id: number) => string;
    };
    readonly SETTINGS: {
        APP: string;
        USER: string;
        LOGO: string;
    };
    readonly ADMIN: {
        STATS: string;
        LOGS: string;
        SETTINGS: string;
    };
    readonly ACTIVITY_TYPES: {
        BASE: string;
        BY_ID: (id: number) => string;
    };
    readonly TASK_TYPES: {
        BASE: string;
        BY_ID: (id: number) => string;
    };
    readonly TASK_STATUSES: {
        BASE: string;
        BY_ID: (id: number) => string;
    };
    readonly TASK_PRIORITIES: {
        BASE: string;
        BY_ID: (id: number) => string;
    };
    readonly TAGS: {
        BASE: string;
        BY_ID: (id: number) => string;
    };
    readonly ROLES: {
        BASE: string;
        BY_ID: (id: number) => string;
        PERMISSIONS: (id: number) => string;
    };
    readonly PERMISSIONS: {
        BASE: string;
        BY_ID: (id: number) => string;
    };
    readonly NOTIFICATIONS: {
        BASE: string;
        BY_ID: (id: number) => string;
        MARK_READ: (id: number) => string;
        MARK_ALL_READ: string;
        SETTINGS: string;
    };
} 