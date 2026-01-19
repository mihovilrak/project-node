import { Pool } from 'pg';

// Integration test database pool
export let testPool: Pool;

// Check if integration tests should run
const shouldRunIntegration = () => {
  return process.env.TEST_DB_HOST && 
         process.env.TEST_DB_PASSWORD && 
         process.env.SKIP_INTEGRATION_TESTS !== 'true';
};

beforeAll(async () => {
  if (!shouldRunIntegration()) {
    console.log('Skipping integration tests - database not configured');
    return;
  }

  testPool = new Pool({
    host: process.env.TEST_DB_HOST || 'localhost',
    port: parseInt(process.env.TEST_DB_PORT || '5432'),
    database: process.env.TEST_DB_NAME || 'pm_test',
    user: process.env.TEST_DB_USER || 'pm_user',
    password: process.env.TEST_DB_PASSWORD,
  });

  // Test connection
  try {
    await testPool.query('SELECT 1');
    console.log('Integration test database connected');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
});

afterAll(async () => {
  if (testPool) {
    await testPool.end();
  }
});

// Helper to check if we should skip
export const skipIfNoDb = () => !shouldRunIntegration();

// Database cleanup utilities
export const cleanupTables = async (tables: string[]) => {
  if (!testPool) return;
  
  for (const table of tables) {
    await testPool.query(`TRUNCATE TABLE ${table} CASCADE`);
  }
};

export const seedTestUser = async () => {
  if (!testPool) return null;
  
  const result = await testPool.query(`
    INSERT INTO users (login, email, password, name, surname, role_id, status_id)
    VALUES ('testuser', 'test@example.com', crypt('password123', gen_salt('bf', 12)), 'Test', 'User', 2, 1)
    ON CONFLICT (login) DO UPDATE SET updated_on = CURRENT_TIMESTAMP
    RETURNING *
  `);
  return result.rows[0];
};

export const seedTestProject = async (userId: number) => {
  if (!testPool) return null;
  
  const result = await testPool.query(`
    INSERT INTO projects (name, description, start_date, due_date, created_by, status_id)
    VALUES ('Test Project', 'Test project description', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', $1, 1)
    RETURNING *
  `, [userId]);
  return result.rows[0];
};

export const seedTestTask = async (projectId: number, userId: number) => {
  if (!testPool) return null;
  
  const result = await testPool.query(`
    SELECT * FROM create_task(
      'Test Task',
      'Test task description',
      8,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '7 days',
      2,
      1,
      1,
      NULL,
      $1,
      $2,
      $2,
      $2,
      ARRAY[]::integer[],
      ARRAY[$2]::integer[]
    )
  `, [projectId, userId]);
  return result.rows[0];
};
