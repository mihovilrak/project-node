import { Request, Response, NextFunction } from 'express';
import csrfMiddleware from '../csrfMiddleware';

describe('csrfMiddleware', () => {
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  const makeReq = (method: string, header?: string): Request =>
    ({
      method,
      get: jest.fn((name: string) =>
        name === 'X-Requested-With' ? header : undefined,
      ),
    }) as unknown as Request;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it.each(['GET', 'HEAD', 'OPTIONS'])('allows %s without header', (method) => {
    csrfMiddleware(makeReq(method), mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
    'allows %s with header',
    (method) => {
      csrfMiddleware(
        makeReq(method, 'XMLHttpRequest'),
        mockRes as Response,
        mockNext,
      );
      expect(mockNext).toHaveBeenCalled();
    },
  );

  it('rejects POST without header', () => {
    csrfMiddleware(makeReq('POST'), mockRes as Response, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing CSRF header' });
  });

  it('rejects DELETE with a different header value', () => {
    csrfMiddleware(makeReq('DELETE', 'fetch'), mockRes as Response, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(403);
  });
});
