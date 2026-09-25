export interface CustomError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export interface ValidationError extends CustomError {
  name: 'ValidationError';
  details: any;
}
