import { Request, Response, NextFunction } from 'express';
import errorHandler from '../errorHandler';
import { CustomError } from '../../types/error';

describe('ErrorHandler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  const originalEnv = process.env.NODE_ENV;

  const handle = (err: CustomError) =>
    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

  beforeEach(() => {
    mockReq = { method: 'GET', originalUrl: '/api/test' };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should handle ValidationError', () => {
    const validationError: CustomError = {
      name: 'ValidationError',
      message: 'Validation failed',
      details: { field: 'email', message: 'Invalid email format' },
    };

    handle(validationError);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Validation Error',
      details: validationError.details,
    });
  });

  it('should handle generic errors with custom status', () => {
    handle({ name: 'Error', message: 'Custom error message', status: 422 });

    expect(mockRes.status).toHaveBeenCalledWith(422);
  });

  it('should default to 500 status when no status provided', () => {
    handle({ name: 'Error', message: 'Something went wrong' });

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it('should never include a stack trace', () => {
    process.env.NODE_ENV = 'development';

    handle({ name: 'Error', message: 'Test error', stack: 'Error stack' });

    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Test error' });
  });

  it('should not include the raw message in production mode', () => {
    process.env.NODE_ENV = 'production';

    handle({ name: 'Error', message: 'Test error', stack: 'Error stack' });

    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
    });
  });

  it('should still echo a deliberate 4xx message in production mode', () => {
    process.env.NODE_ENV = 'production';

    handle({ name: 'Error', message: 'Name is required', status: 400 });

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Name is required',
    });
  });

  it.each([
    ['23505', 409, 'Resource already exists'],
    ['23503', 404, 'Referenced resource not found'],
    ['P0002', 404, 'Resource not found'],
    ['22023', 400, 'Invalid request'],
  ])('maps postgres error %s to %i', (code, status, error) => {
    handle({ name: 'error', message: 'constraint users_login_key', code });

    expect(mockRes.status).toHaveBeenCalledWith(status);
    expect(mockRes.json).toHaveBeenCalledWith({ error });
  });
});
