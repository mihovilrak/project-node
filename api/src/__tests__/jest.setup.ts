import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Setup test database connection (only if credentials are available)
// This allows unit tests to run without a database connection
export let testPool: Pool | null = null;

// Only create pool if database credentials are provided
if (process.env.DB_USER && process.env.DB_PASSWORD) {
  testPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.TEST_DB_NAME || 'pm_test',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
}

// Global test setup
beforeAll(async () => {
  // Add any global setup here
});

// Global test teardown
afterAll(async () => {
  if (testPool) {
    await testPool.end();
  }
});

// Reset database state between tests
afterEach(async () => {
  // Add cleanup queries here if needed
});
