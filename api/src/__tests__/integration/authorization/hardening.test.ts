import supertest from 'supertest';
import { Express } from 'express';
import request from '../setup/request';
import {
  cleanupTables,
  cookieHeader,
  seedLowPrivilegeUser,
  seedTestProject,
  seedTestTask,
  seedTestUser,
  testPool,
} from '../setup/integration.setup';

const TABLES = [
  'comments',
  'files',
  'notifications',
  'time_logs',
  'task_tags',
  'watchers',
  'tasks',
  'project_users',
  'projects',
  'session',
  'users',
] as const;
const NO_PERMISSION_ROLE = 'Hardening no permissions';
const ACTIVE_TAG = 'hardening-active';
const INACTIVE_TAG = 'hardening-inactive';

let app: Express;
let pm: any;
let dev: any;
let reporter: any;
let outsider: any;
let admin: any;
let projectA: any;
let projectB: any;
let taskA1: number;
let taskA2: number;
let taskB: number;
let pmCookies: string;
let devCookies: string;
let reporterCookies: string;
let adminCookies: string;

const createUser = async (login: string, role: string) =>
  (
    await testPool.query(
      `INSERT INTO users (login, email, password, name, surname, role_id, status_id)
       VALUES ($1::varchar, $1 || '@example.com', crypt('password123', gen_salt('bf', 4)),
               'Hard', $1, (SELECT id FROM roles WHERE name = $2), 1)
       RETURNING *`,
      [login, role],
    )
  ).rows[0];

const addMember = (projectId: number, userId: number) =>
  testPool.query(
    'INSERT INTO project_users (project_id, user_id) VALUES ($1, $2)',
    [projectId, userId],
  );

const login = async (loginName: string) => {
  const response = await request(app)
    .post('/api/login')
    .send({ login: loginName, password: 'password123' });
  expect(response.status).toBe(200);
  return cookieHeader(response.headers['set-cookie']);
};

const as = (cookies: string) => ({
  get: (path: string) => request(app).get(path).set('Cookie', cookies),
  post: (path: string, body: object = {}) =>
    request(app).post(path).set('Cookie', cookies).send(body),
  put: (path: string, body: object = {}) =>
    request(app).put(path).set('Cookie', cookies).send(body),
  patch: (path: string, body: object = {}) =>
    request(app).patch(path).set('Cookie', cookies).send(body),
  delete: (path: string) => request(app).delete(path).set('Cookie', cookies),
});

const taskPayload = (overrides: object = {}) => ({
  name: 'Hardening task',
  project_id: projectA.id,
  holder_id: pm.id,
  assignee_id: pm.id,
  priority_id: 2,
  status_id: 1,
  type_id: 1,
  start_date: new Date().toISOString(),
  due_date: new Date(Date.now() + 86_400_000).toISOString(),
  ...overrides,
});

const removeTags = async () => {
  await testPool.query(
    `DELETE FROM task_tags WHERE tag_id IN
       (SELECT id FROM tags WHERE name = ANY($1))`,
    [[ACTIVE_TAG, INACTIVE_TAG]],
  );
  await testPool.query('DELETE FROM tags WHERE name = ANY($1)', [
    [ACTIVE_TAG, INACTIVE_TAG],
  ]);
};

// The shared setup ends testPool before a file-level afterAll could run, so
// fixtures outside TABLES are removed by the tests that create them.
const removeFixtures = async () => {
  await removeTags();
  await cleanupTables(TABLES);
  await testPool.query('DELETE FROM roles WHERE name = $1', [
    NO_PERMISSION_ROLE,
  ]);
};

beforeAll(async () => {
  app = (await import('../../../app')).default;
  await removeFixtures();

  pm = await seedTestUser();
  dev = await seedLowPrivilegeUser();
  reporter = await createUser('hardreporter', 'Reporter');
  outsider = await createUser('hardoutsider', 'Developer');
  admin = await createUser('hardadmin', 'Admin');

  projectA = await seedTestProject(pm.id);
  projectB = await seedTestProject(pm.id);
  await addMember(projectA.id, dev.id);
  await addMember(projectA.id, reporter.id);

  taskA1 = (await seedTestTask(projectA.id, pm.id)).task_id;
  taskA2 = (await seedTestTask(projectA.id, pm.id)).task_id;
  taskB = (await seedTestTask(projectB.id, pm.id)).task_id;

  pmCookies = await login('testuser');
  devCookies = await login('limiteduser');
  reporterCookies = await login('hardreporter');
  adminCookies = await login('hardadmin');
});

describe('CSRF', () => {
  it('rejects a state-changing request without the header', async () => {
    const response = await supertest(app)
      .post('/api/logout')
      .set('Cookie', pmCookies);
    expect(response.status).toBe(403);
  });

  it('lets safe methods through without the header', async () => {
    const response = await supertest(app)
      .get('/api/check-session')
      .set('Cookie', pmCookies);
    expect(response.status).toBe(200);
  });
});

describe('users', () => {
  it('limits the full user list to admins and offers options to everyone', async () => {
    expect((await as(devCookies).get('/api/users')).status).toBe(403);
    expect((await as(adminCookies).get('/api/users')).status).toBe(200);
    expect((await as(devCookies).get(`/api/users/${pm.id}`)).status).toBe(403);
    expect((await as(adminCookies).get(`/api/users/${pm.id}`)).status).toBe(
      200,
    );

    const options = await as(devCookies).get('/api/users/options');
    expect(options.status).toBe(200);
    expect(options.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: pm.id })]),
    );
    expect(options.body[0]).not.toHaveProperty('password');
  });

  it('serves the welcome message to any signed-in user', async () => {
    const response = await as(devCookies).get('/api/settings/welcome');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('welcome_message');
  });

  it('stops an admin from deactivating or deleting themselves', async () => {
    const status = await as(adminCookies).patch(
      `/api/users/${admin.id}/status`,
      { status: 2 },
    );
    expect(status.status).toBe(400);

    const deletion = await as(adminCookies).delete(`/api/users/${admin.id}`);
    expect(deletion.status).toBe(400);
  });

  it('ends the sessions of a deactivated user', async () => {
    await createUser('harddeactivated', 'Developer');
    const cookies = await login('harddeactivated');
    const { id } = (
      await testPool.query(
        "SELECT id FROM users WHERE login = 'harddeactivated'",
      )
    ).rows[0];

    expect((await as(cookies).get('/api/check-session')).status).toBe(200);
    const response = await as(adminCookies).patch(`/api/users/${id}/status`, {
      status: 2,
    });
    expect(response.status).toBe(200);
    expect((await as(cookies).get('/api/check-session')).status).toBe(401);
  });
});

describe('login lockout', () => {
  it('locks an account after repeated failures, even for the right password', async () => {
    await createUser('hardlocked', 'Developer');
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const failed = await request(app)
        .post('/api/login')
        .send({ login: 'hardlocked', password: 'wrong-password' });
      expect(failed.status).toBe(401);
    }

    const locked = await request(app)
      .post('/api/login')
      .send({ login: 'hardlocked', password: 'password123' });
    expect(locked.status).toBe(429);
    expect(Number(locked.headers['retry-after'])).toBeGreaterThan(0);
  });
});

describe('roles', () => {
  it('protects the Admin role', async () => {
    const { id } = (
      await testPool.query("SELECT id FROM roles WHERE name = 'Admin'")
    ).rows[0];

    const rename = await as(adminCookies).put(`/api/roles/${id}`, {
      name: 'Renamed admin',
    });
    expect(rename.status).toBe(403);

    const deletion = await as(adminCookies).delete(`/api/roles/${id}`);
    expect(deletion.status).toBe(403);

    expect((await as(adminCookies).delete('/api/roles/abc')).status).toBe(400);
  });
});

describe('tasks', () => {
  it('rejects a holder, assignee or parent outside the project on create', async () => {
    const assignee = await as(pmCookies).post(
      '/api/tasks',
      taskPayload({ assignee_id: outsider.id }),
    );
    expect(assignee.status).toBe(400);

    const holder = await as(pmCookies).post(
      '/api/tasks',
      taskPayload({ holder_id: outsider.id }),
    );
    expect(holder.status).toBe(400);

    const parent = await as(pmCookies).post(
      '/api/tasks',
      taskPayload({ parent_id: taskB }),
    );
    expect(parent.status).toBe(400);
  });

  it('rejects a non-member assignee on update', async () => {
    const response = await as(pmCookies).put(`/api/tasks/${taskA1}`, {
      assignee_id: outsider.id,
    });
    expect(response.status).toBe(400);
  });

  it('never moves a task to another project', async () => {
    const response = await as(pmCookies).put(`/api/tasks/${taskA1}`, {
      name: 'Renamed task',
      project_id: projectB.id,
    });
    expect(response.status).toBe(200);

    const { rows } = await testPool.query(
      'SELECT name, project_id FROM tasks WHERE id = $1',
      [taskA1],
    );
    expect(rows[0]).toEqual({ name: 'Renamed task', project_id: projectA.id });
  });

  it('requires Edit tasks for status changes, tags and watching others', async () => {
    expect(
      (
        await as(reporterCookies).patch(`/api/tasks/${taskA1}/change-status`, {
          statusId: 2,
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await as(reporterCookies).post(`/api/tasks/${taskA1}/tags`, {
          tagIds: [1],
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await as(reporterCookies).post(`/api/tasks/${taskA1}/watchers`, {
          userId: dev.id,
        })
      ).status,
    ).toBe(403);
    const watched = await as(reporterCookies).post(
      `/api/tasks/${taskA1}/watchers`,
      { userId: reporter.id },
    );
    expect(watched.status).toBe(201);
    expect(watched.body).toMatchObject({
      task_id: taskA1,
      user_id: reporter.id,
      user_name: expect.any(String),
    });
  });

  it('only watches with project members', async () => {
    const response = await as(pmCookies).post(`/api/tasks/${taskA1}/watchers`, {
      userId: outsider.id,
    });
    expect(response.status).toBe(403);
  });

  it('attaches active tags only', async () => {
    const { rows } = await testPool.query(
      `INSERT INTO tags (name, color, active)
       VALUES ($1, '#000000', true), ($2, '#000000', false)
       RETURNING id, active`,
      [ACTIVE_TAG, INACTIVE_TAG],
    );
    const activeId = rows.find((row) => row.active).id;
    const inactiveId = rows.find((row) => !row.active).id;

    const response = await as(devCookies).post(`/api/tasks/${taskA1}/tags`, {
      tagIds: [activeId, inactiveId],
    });
    expect(response.status).toBe(200);
    expect(response.body.map((tag: { id: number }) => tag.id)).toEqual([
      activeId,
    ]);

    const stored = await testPool.query(
      'SELECT tag_id FROM task_tags WHERE task_id = $1',
      [taskA1],
    );
    expect(stored.rows).toEqual([{ tag_id: activeId }]);

    expect(
      (
        await as(devCookies).post(`/api/tasks/${taskA1}/tags`, {
          tagIds: ['x'],
        })
      ).status,
    ).toBe(400);
    expect(
      (await as(devCookies).delete(`/api/tasks/${taskA1}/tags/${inactiveId}`))
        .status,
    ).toBe(404);

    await removeTags();
  });
});

describe('comments', () => {
  it('only edits or deletes a comment through its own task', async () => {
    const created = await as(devCookies).post(`/api/tasks/${taskA1}/comments`, {
      comment: 'Scoped comment',
    });
    expect(created.status).toBe(201);
    const commentId = created.body.id;

    expect(
      (
        await as(devCookies).put(`/api/tasks/${taskA2}/comments/${commentId}`, {
          comment: 'Moved',
        })
      ).status,
    ).toBe(404);
    expect(
      (
        await as(devCookies).delete(
          `/api/tasks/${taskA2}/comments/${commentId}`,
        )
      ).status,
    ).toBe(404);

    const { rows } = await testPool.query(
      'SELECT comment, active FROM comments WHERE id = $1',
      [commentId],
    );
    expect(rows[0]).toEqual({ comment: 'Scoped comment', active: true });
  });
});

describe('time logs', () => {
  const logPath = () => `/api/time-logs/tasks/${taskA2}/logs`;
  const log = (cookies: string, spent_time: unknown) =>
    as(cookies).post(logPath(), { spent_time, activity_type_id: 1 });

  it('requires the Log time permission', async () => {
    const { rows } = await testPool.query(
      'INSERT INTO roles (name) VALUES ($1) RETURNING id',
      [NO_PERMISSION_ROLE],
    );
    expect(rows[0].id).toBeDefined();
    const user = await createUser('hardnolog', NO_PERMISSION_ROLE);
    await addMember(projectA.id, user.id);

    expect((await log(await login('hardnolog'), 1)).status).toBe(403);

    await testPool.query(
      `UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'Developer')
       WHERE id = $1`,
      [user.id],
    );
    await testPool.query('DELETE FROM roles WHERE name = $1', [
      NO_PERMISSION_ROLE,
    ]);
  });

  it.each([0, -1, 24.5, 25, 'abc'])(
    'rejects spent_time %p',
    async (spentTime) => {
      expect((await log(devCookies, spentTime)).status).toBe(400);
    },
  );

  it('accepts up to 24 hours and pages the task log', async () => {
    expect((await log(devCookies, 24)).status).toBe(201);
    expect((await log(devCookies, 1.5)).status).toBe(201);

    const firstPage = await as(devCookies).get(`${logPath()}?limit=1`);
    expect(firstPage.status).toBe(200);
    expect(firstPage.body).toHaveLength(1);

    const secondPage = await as(devCookies).get(
      `${logPath()}?limit=1&offset=1`,
    );
    expect(secondPage.body).toHaveLength(1);
    expect(secondPage.body[0].id).not.toBe(firstPage.body[0].id);
  });
});

describe('projects', () => {
  it('rejects a parent that would create a cycle', async () => {
    const self = await as(pmCookies).put(`/api/projects/${projectA.id}`, {
      parent_id: projectA.id,
    });
    expect(self.status).toBe(400);

    const child = await as(pmCookies).put(`/api/projects/${projectB.id}`, {
      parent_id: projectA.id,
    });
    expect(child.status).toBe(200);

    const loop = await as(pmCookies).put(`/api/projects/${projectA.id}`, {
      parent_id: projectB.id,
    });
    expect(loop.status).toBe(400);

    const cleared = await as(pmCookies).put(`/api/projects/${projectB.id}`, {
      parent_id: null,
    });
    expect(cleared.status).toBe(200);
    const { rows } = await testPool.query(
      'SELECT parent_id FROM projects WHERE id = $1',
      [projectB.id],
    );
    expect(rows[0].parent_id).toBeNull();
  });

  it('rejects a parent the user cannot access', async () => {
    const hidden = await seedTestProject(admin.id);
    const response = await as(pmCookies).post('/api/projects', {
      name: 'Child of hidden',
      start_date: '2026-01-01',
      due_date: '2026-12-31',
      parent_id: hidden.id,
    });
    expect(response.status).toBe(403);
  });

  it('ignores status_id on a plain project update', async () => {
    const response = await as(pmCookies).put(`/api/projects/${projectA.id}`, {
      name: 'Renamed project',
      status_id: 3,
    });
    expect(response.status).toBe(200);
    const { rows } = await testPool.query(
      'SELECT name, status_id FROM projects WHERE id = $1',
      [projectA.id],
    );
    expect(rows[0]).toEqual({ name: 'Renamed project', status_id: 1 });
  });

  it('notifies the newly added member', async () => {
    const response = await as(pmCookies).post(
      `/api/projects/${projectA.id}/members`,
      { userId: outsider.id },
    );
    expect(response.status).toBe(201);

    const { rows } = await testPool.query(
      `SELECT n.user_id FROM notifications n
       JOIN notification_types nt ON nt.id = n.type_id
       WHERE nt.name = 'Added to Project' AND n.user_id = ANY($1)`,
      [[outsider.id, pm.id]],
    );
    expect(rows).toEqual([{ user_id: outsider.id }]);
  });
});

describe('indexes', () => {
  it('creates the lookup indexes and drops the redundant one', async () => {
    const { rows } = await testPool.query(
      `SELECT indexname FROM pg_indexes
       WHERE schemaname = 'public' AND indexname = ANY($1)`,
      [
        [
          'task_due_date_idx',
          'time_logs_log_date_idx',
          'notifications_data_idx',
          'session_user_id_idx',
          'notifications_user_idx',
        ],
      ],
    );
    expect(rows.map((row) => row.indexname).sort()).toEqual([
      'notifications_data_idx',
      'session_user_id_idx',
      'task_due_date_idx',
      'time_logs_log_date_idx',
    ]);
  });
});
