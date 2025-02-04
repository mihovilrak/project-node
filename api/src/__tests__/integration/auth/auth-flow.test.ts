import request from 'supertest';
import app from '../../../app';
import { clearTestData, createTestUser } from '../../utils/test-helpers';

describe('Authentication Flow', () => {
  beforeEach(async () => {
    await clearTestData();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('newuser');
    });

    // Add more registration tests
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser();
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    // Add more login tests
  });
});
