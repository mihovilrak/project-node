import request from 'supertest';
import { Express } from 'express';
import { skipIfNoDb, seedTestUser, cleanupTables } from '../setup/integration.setup';

// Dynamically import app only if DB is available
let app: Express;

beforeAll(async () => {
  if (skipIfNoDb()) {
    return;
  }
  
  // Dynamically require app to avoid startup errors
  const appModule = await import('../../../app');
  app = appModule.default;
});

const describeOrSkip = skipIfNoDb() ? describe.skip : describe;

describeOrSkip('Authentication Flow', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTables(['users', 'sessions']);
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      await seedTestUser();
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          login: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 with incorrect password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          login: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    it('should return 401 with non-existent user', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          login: 'nonexistent',
          password: 'password123'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/session', () => {
    it('should return 401 when not logged in', async () => {
      const response = await request(app)
        .get('/api/session');

      expect(response.status).toBe(401);
    });

    it('should return user data when logged in', async () => {
      await seedTestUser();

      // Login first
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          login: 'testuser',
          password: 'password123'
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Check session
      const sessionResponse = await request(app)
        .get('/api/session')
        .set('Cookie', cookies);

      expect(sessionResponse.status).toBe(200);
      expect(sessionResponse.body).toHaveProperty('user');
      expect(sessionResponse.body.user.login).toBe('testuser');
    });
  });

  describe('POST /api/logout', () => {
    it('should logout successfully', async () => {
      await seedTestUser();

      // Login first
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          login: 'testuser',
          password: 'password123'
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Logout
      const logoutResponse = await request(app)
        .post('/api/logout')
        .set('Cookie', cookies);

      expect(logoutResponse.status).toBe(200);

      // Verify session is destroyed
      const sessionResponse = await request(app)
        .get('/api/session')
        .set('Cookie', cookies);

      expect(sessionResponse.status).toBe(401);
    });
  });
});
