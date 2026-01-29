import request from 'supertest';
import { Express } from 'express';
import { seedTestUser, seedTestProject, seedTestTask, cleanupTables, cookieHeader } from '../setup/integration.setup';

let app: Express;
let authCookies = '';
let testUser: any = null;
let testProject: any = null;

beforeAll(async () => {
  const appModule = await import('../../../app');
  app = appModule.default;
});

describe('Task CRUD Operations', () => {
  beforeEach(async () => {
    // Clean up and seed test data
    await cleanupTables(['tasks', 'task_tags', 'watchers', 'projects', 'project_users', 'users', 'session']);
    testUser = await seedTestUser();
    testProject = await seedTestProject(testUser.id);

    // Login to get auth cookies
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        login: 'testuser',
        password: 'password123'
      });

    authCookies = cookieHeader(loginResponse.headers['set-cookie']);
  });

  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/tasks');

      expect(response.status).toBe(401);
    });

    it('should return tasks filtered by project', async () => {
      // Create a task first
      await seedTestTask(testProject.id, testUser.id);

      const response = await request(app)
        .get(`/api/tasks?project_id=${testProject.id}`)
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        name: 'New Task',
        description: 'A new test task',
        project_id: testProject.id,
        holder_id: testUser.id,
        assignee_id: testUser.id,
        priority_id: 2,
        status_id: 1,
        type_id: 1,
        start_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_time: 8
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', authCookies)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('task_id');
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', authCookies)
        .send({
          description: 'Missing required fields'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          name: 'Test Task'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const task = await seedTestTask(testProject.id, testUser.id);
      taskId = task.task_id;
    });

    it('should return task details', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', taskId);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/99999')
        .set('Cookie', authCookies);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const task = await seedTestTask(testProject.id, testUser.id);
      taskId = task.task_id;
    });

    it('should update task details', async () => {
      const updateData = {
        name: 'Updated Task Name',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Cookie', authCookies)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
    });
  });

  describe('PATCH /api/tasks/:id/change-status', () => {
    let taskId: number;

    beforeEach(async () => {
      const task = await seedTestTask(testProject.id, testUser.id);
      taskId = task.task_id;
    });

    it('should update task status', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}/change-status`)
        .set('Cookie', authCookies)
        .send({ statusId: 2 });

      expect(response.status).toBe(200);
      expect(response.body.status_id).toBe(2);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId: number;

    beforeEach(async () => {
      const task = await seedTestTask(testProject.id, testUser.id);
      taskId = task.task_id;
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);

      // Verify task is marked as deleted (status_id = 3)
      const getResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Cookie', authCookies);

      // Task might still be returned but with deleted status
      if (getResponse.status === 200) {
        expect(getResponse.body.status_id).toBe(3);
      }
    });
  });

  describe('GET /api/tasks/statuses', () => {
    it('should return all task statuses', async () => {
      const response = await request(app)
        .get('/api/tasks/statuses')
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/tasks/priorities', () => {
    it('should return all priorities', async () => {
      const response = await request(app)
        .get('/api/tasks/priorities')
        .set('Cookie', authCookies);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});
