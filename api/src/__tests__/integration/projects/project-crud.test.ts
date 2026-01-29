import request from 'supertest';
import { Express } from 'express';
import { seedTestUser, seedTestProject, cleanupTables, cookieHeader } from '../setup/integration.setup';

let app: Express;
let authCookies = '';
let testUser: any = null;

beforeAll(async () => {
  const appModule = await import('../../../app');
  app = appModule.default;
});

describe('Project CRUD Operations', () => {
  beforeEach(async () => {
    // Clean up and seed test data
    await cleanupTables(['projects', 'project_users', 'tasks', 'users', 'session']);
    testUser = await seedTestUser();

    // Login to get auth cookies
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        login: 'testuser',
        password: 'password123'
      });

    authCookies = cookieHeader(loginResponse.headers['set-cookie']);
  });

  describe('GET /api/projects', () => {
    it('should return empty array when no projects exist', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/projects');

      expect(response.status).toBe(401);
    });

    it('should return user projects after creating one', async () => {
      // Create a project first
      await request(app)
        .post('/api/projects')
        .set('Cookie', authCookies)
        .send({
          name: 'Test Project',
          description: 'Test description',
          start_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      const response = await request(app)
        .get('/api/projects')
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'New Project',
        description: 'A new test project',
        start_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Cookie', authCookies)
        .send(projectData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(projectData.name);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Cookie', authCookies)
        .send({
          description: 'Missing required fields'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'Test Project'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId: number;

    beforeEach(async () => {
      const project = await seedTestProject(testUser.id);
      projectId = project.id;
    });

    it('should return project details', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', projectId);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/99999')
        .set('Cookie', authCookies);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    let projectId: number;

    beforeEach(async () => {
      const project = await seedTestProject(testUser.id);
      projectId = project.id;
    });

    it('should update project details', async () => {
      const updateData = {
        name: 'Updated Project Name',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Cookie', authCookies)
        .send(updateData);

      expect(response.status).toBe(200);
      // API returns row count; verify update by fetching project
      const getResponse = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Cookie', authCookies);
      expect(getResponse.body.name).toBe(updateData.name);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let projectId: number;

    beforeEach(async () => {
      const project = await seedTestProject(testUser.id);
      projectId = project.id;
    });

    it('should delete a project', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);

      // Delete is soft (status_id = 3); project still exists with deleted status
      const getResponse = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Cookie', authCookies);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.status_id).toBe(3);
    });
  });
});
