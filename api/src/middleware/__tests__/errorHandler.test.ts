import { Request, Response, NextFunction } from 'express';
import errorHandler from '../errorHandler';
import { CustomError } from '../../types/error';

describe('ErrorHandler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should handle ValidationError', async () => {
    const validationError: CustomError = {
      name: 'ValidationError',
      message: 'Validation failed',
      details: { field: 'email', message: 'Invalid email format' }
    };

    await errorHandler(validationError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Validation Error',
      details: validationError.details
    });
  });

  it('should handle UnauthorizedError', async () => {
    const unauthorizedError: CustomError = {
      name: 'UnauthorizedError',
      message: 'Unauthorized'
    };

    await errorHandler(unauthorizedError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Invalid token or no token provided'
    });
  });

  it('should handle generic errors with custom status', async () => {
    const genericError: CustomError = {
      name: 'Error',
      message: 'Custom error message',
      status: 422
    };

    await errorHandler(genericError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(422);
  });

  it('should default to 500 status when no status provided', async () => {
    const genericError: CustomError = {
      name: 'Error',
      message: 'Something went wrong'
    };

    await errorHandler(genericError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it('should include stack trace in development mode', async () => {
    process.env.NODE_ENV = 'development';
    const errorWithStack: CustomError = {
      name: 'Error',
      message: 'Test error',
      stack: 'Error stack trace'
    };

    await errorHandler(errorWithStack, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: 'Error stack trace'
      })
    );
  });

  it('should not include stack trace in production mode', async () => {
    process.env.NODE_ENV = 'production';
    const errorWithStack: CustomError = {
      name: 'Error',
      message: 'Test error',
      stack: 'Error stack trace'
    };

    await errorHandler(errorWithStack, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Test error'
    });
  });
});
