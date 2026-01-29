import { Express } from 'express';
import request from 'supertest';
import { testPool } from '../jest.setup';

export const createTestUser = async () => {
  if (!testPool) {
    throw new Error('testPool is not available. Ensure DB_USER and DB_PASSWORD are set.');
  }
  const result = await testPool.query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    ['testuser', 'test@example.com', 'hashedpassword']
  );
  return result.rows[0];
};

export const loginTestUser = async (app: Express) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'testuser',
      password: 'password123'
    });
  return response.headers['set-cookie'];
};

export const clearTestData = async () => {
  if (!testPool) {
    throw new Error('testPool is not available. Ensure DB_USER and DB_PASSWORD are set.');
  }
  await testPool.query('TRUNCATE users CASCADE');
  // Add more tables to clear as needed
};

export const createTestProject = async (userId: string) => {
  if (!testPool) {
    throw new Error('testPool is not available. Ensure DB_USER and DB_PASSWORD are set.');
  }
  const result = await testPool.query(
    'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
    ['Test Project', 'Test Description', userId]
  );
  return result.rows[0];
};
