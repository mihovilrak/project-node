import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Setup test database connection
export const testPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.TEST_DB_NAME || 'pm_test',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Global test setup
beforeAll(async () => {
  // Add any global setup here
});

// Global test teardown
afterAll(async () => {
  await testPool.end();
});

// Reset database state between tests
afterEach(async () => {
  // Add cleanup queries here if needed
});
