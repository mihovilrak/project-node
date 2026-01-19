import { Pool } from 'pg';
import session from 'express-session';
import createSessionMiddleware from '../sessionMiddleware';

// Mock express-session and connect-pg-simple
jest.mock('express-session', () => {
  const mockSession = jest.fn(() => jest.fn());
  return mockSession;
});

jest.mock('connect-pg-simple', () => {
  return jest.fn(() => {
    return jest.fn().mockImplementation((options) => ({
      ...options,
      type: 'pg-session-store'
    }));
  });
});

describe('SessionMiddleware', () => {
  let mockPool: jest.Mocked<Pool>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn()
    } as unknown as jest.Mocked<Pool>;
    jest.clearAllMocks();
  });

  describe('createSessionMiddleware', () => {
    it('should create session middleware with correct configuration', () => {
      const sessionSecret = 'test-secret-key';
      
      const middleware = createSessionMiddleware(mockPool, sessionSecret);

      expect(session).toHaveBeenCalledWith(
        expect.objectContaining({
          secret: sessionSecret,
          resave: false,
          saveUninitialized: false,
          rolling: true,
          cookie: expect.objectContaining({
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000, // 1 hour
            secure: false,
            httpOnly: true
          })
        })
      );
      expect(middleware).toBeDefined();
    });

    it('should configure session store with pool', () => {
      const sessionSecret = 'another-secret';
      
      createSessionMiddleware(mockPool, sessionSecret);

      // Verify session was called with store configuration
      expect(session).toHaveBeenCalledWith(
        expect.objectContaining({
          store: expect.objectContaining({
            pool: mockPool,
            tableName: 'session',
            createTableIfMissing: false,
            pruneSessionInterval: 60
          })
        })
      );
    });

    it('should return a request handler function', () => {
      const middleware = createSessionMiddleware(mockPool, 'secret');

      expect(typeof middleware).toBe('function');
    });
  });
});
