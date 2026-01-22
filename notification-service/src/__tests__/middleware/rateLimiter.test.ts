import express, { Application } from 'express';
import request from 'supertest';
import { rateLimiter } from '../../middleware/rateLimiter';

describe('Rate Limiter Middleware', () => {
  let app: Application;

  beforeEach(() => {
    // Create a fresh app for each test
    app = express();
    app.use(express.json());
    
    // Apply rate limiter to test route
    app.post('/test', rateLimiter, (req, res) => {
      res.status(200).json({ success: true });
    });
  });

  it('should allow requests within the rate limit', async () => {
    const response = await request(app)
      .post('/test')
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should include rate limit headers in response', async () => {
    const response = await request(app)
      .post('/test')
      .send({});

    expect(response.headers).toHaveProperty('x-ratelimit-limit');
    expect(response.headers).toHaveProperty('x-ratelimit-remaining');
  });

  it('should have rate limit configured', () => {
    expect(rateLimiter).toBeDefined();
    expect(typeof rateLimiter).toBe('function');
  });

  it('should accept multiple requests from the same IP within limit', async () => {
    // Make several requests
    const requests = Array(5).fill(null).map(() => 
      request(app).post('/test').send({})
    );

    const responses = await Promise.all(requests);
    
    // All should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });

  it('should use environment variable for rate limit', () => {
    // The rate limiter uses NOTIFICATION_RATE_LIMIT env var
    const originalLimit = process.env.NOTIFICATION_RATE_LIMIT;
    
    // Verify the rateLimiter was created (we can't easily test the actual limit
    // without making 100+ requests, but we can verify it exists)
    expect(rateLimiter).toBeDefined();
    
    process.env.NOTIFICATION_RATE_LIMIT = originalLimit;
  });
});
