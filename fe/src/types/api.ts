/**
 * Represent a generic API response wrapper containing the response payload, a numeric status code, and an optional message.
 *
 * Fields: data is required and typed as T; message is optional; status is a required numeric status code (commonly an HTTP status) used to indicate success or failure.
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}
