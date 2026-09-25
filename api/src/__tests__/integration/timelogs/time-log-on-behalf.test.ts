import request from '../setup/request';
import { Express } from 'express';
import {
  cleanupTables,
  loginAs,
  seedAdminUser,
  seedLowPrivilegeUser,
  seedTestProject,
  seedTestTask,
  seedTestUser,
  testPool,
} from '../setup/integration.setup';

let app: Express;
let adminCookies = '';
let memberCookies = '';
let member: any;
let outsider: any;
let taskId: number;
let projectId: number;

beforeAll(async () => {
  app = (await import('../../../app')).default;
});

beforeEach(async () => {
  await cleanupTables([
    'time_logs',
    'tasks',
    'projects',
    'project_users',
    'session',
    'users',
  ]);
  await seedAdminUser();
  member = await seedTestUser();
  outsider = await seedLowPrivilegeUser();
  const project = await seedTestProject(member.id);
  projectId = project.id;
  taskId = (await seedTestTask(project.id, member.id)).task_id;
  adminCookies = await loginAs(app, 'adminuser');
  memberCookies = await loginAs(app, 'testuser');
});

const logBody = (extra: Record<string, unknown> = {}) => ({
  spent_time: 1.5,
  activity_type_id: 1,
  ...extra,
});

describe('POST /api/time-logs/tasks/:taskId/logs with user_id', () => {
  it('lets an admin log time for a project member', async () => {
    const response = await request(app)
      .post(`/api/time-logs/tasks/${taskId}/logs`)
      .set('Cookie', adminCookies)
      .send(logBody({ user_id: member.id }));

    expect(response.status).toBe(201);
    expect(response.body.user_id).toBe(member.id);
  });

  it('returns 403 when a non-admin logs for someone else', async () => {
    const response = await request(app)
      .post(`/api/time-logs/tasks/${taskId}/logs`)
      .set('Cookie', memberCookies)
      .send(logBody({ user_id: outsider.id }));

    expect(response.status).toBe(403);
  });

  it('accepts a non-admin passing their own id', async () => {
    const response = await request(app)
      .post(`/api/time-logs/tasks/${taskId}/logs`)
      .set('Cookie', memberCookies)
      .send(logBody({ user_id: member.id }));

    expect(response.status).toBe(201);
    expect(response.body.user_id).toBe(member.id);
  });

  it('returns 400 when the target is not a project member', async () => {
    const response = await request(app)
      .post(`/api/time-logs/tasks/${taskId}/logs`)
      .set('Cookie', adminCookies)
      .send(logBody({ user_id: outsider.id }));

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/member/);
  });

  it('returns 400 when the target is inactive', async () => {
    await testPool.query('UPDATE users SET status_id = 2 WHERE id = $1', [
      member.id,
    ]);
    const response = await request(app)
      .post(`/api/time-logs/tasks/${taskId}/logs`)
      .set('Cookie', adminCookies)
      .send(logBody({ user_id: member.id }));

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/active/);
  });
});

describe('PUT /api/time-logs/:timeLogId with user_id', () => {
  let logId: number;

  beforeEach(async () => {
    await testPool.query(
      'INSERT INTO project_users (project_id, user_id) VALUES ($1, $2)',
      [projectId, outsider.id],
    );
    const created = await request(app)
      .post(`/api/time-logs/tasks/${taskId}/logs`)
      .set('Cookie', memberCookies)
      .send(logBody());
    logId = created.body.id;
  });

  it('lets an admin reassign the log', async () => {
    const response = await request(app)
      .put(`/api/time-logs/${logId}`)
      .set('Cookie', adminCookies)
      .send({ user_id: outsider.id });

    expect(response.status).toBe(200);
    expect(response.body.user_id).toBe(outsider.id);
  });

  it('returns 403 when the owner tries to reassign it', async () => {
    const response = await request(app)
      .put(`/api/time-logs/${logId}`)
      .set('Cookie', memberCookies)
      .send({ user_id: outsider.id });

    expect(response.status).toBe(403);
  });

  it('accepts the current owner even after they left the project', async () => {
    await testPool.query(
      'DELETE FROM project_users WHERE project_id = $1 AND user_id = $2',
      [projectId, member.id],
    );
    const response = await request(app)
      .put(`/api/time-logs/${logId}`)
      .set('Cookie', adminCookies)
      .send({ user_id: member.id, spent_time: 2 });

    expect(response.status).toBe(200);
    expect(response.body.user_id).toBe(member.id);
  });

  it('returns 400 for a null user_id', async () => {
    const response = await request(app)
      .put(`/api/time-logs/${logId}`)
      .set('Cookie', adminCookies)
      .send({ user_id: null });

    expect(response.status).toBe(400);
  });
});
