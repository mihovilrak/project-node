export interface CustomError extends Error {
  status?: number;
  details?: any;
}

export interface ValidationError extends CustomError {
  name: 'ValidationError';
  details: any;
}

export interface UnauthorizedError extends CustomError {
  name: 'UnauthorizedError';
}
