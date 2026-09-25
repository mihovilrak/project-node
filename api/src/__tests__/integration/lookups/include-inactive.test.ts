import request from '../setup/request';
import { Express } from 'express';
import {
  cleanupTables,
  loginAs,
  seedAdminUser,
  seedLowPrivilegeUser,
  testPool,
} from '../setup/integration.setup';

let app: Express;
let adminCookies = '';
let userCookies = '';

const lookups = [
  { path: '/api/tags', table: 'tags', cols: 'name, color' },
  {
    path: '/api/admin/task-types',
    table: 'task_types',
    cols: 'name, color, icon',
  },
  {
    path: '/api/admin/activity-types',
    table: 'activity_types',
    cols: 'name, color',
  },
] as const;

const NAME = 'IT inactive lookup';

// Log in once: the login limiter allows 20 attempts per IP per window.
beforeAll(async () => {
  app = (await import('../../../app')).default;
  await cleanupTables(['session', 'users']);
  await seedAdminUser();
  await seedLowPrivilegeUser();
  adminCookies = await loginAs(app, 'adminuser');
  userCookies = await loginAs(app, 'limiteduser');
});

afterEach(async () => {
  for (const { table } of lookups) {
    await testPool.query(`DELETE FROM ${table} WHERE name = $1`, [NAME]);
  }
});

describe.each(lookups)('$path include_inactive', ({ path, table, cols }) => {
  let id: number;

  beforeEach(async () => {
    const values = cols === 'name, color' ? '$1, $2' : `$1, $2, 'Task'`;
    const result = await testPool.query(
      `INSERT INTO ${table} (${cols}, active) VALUES (${values}, false)
       RETURNING id`,
      [NAME, '#123456'],
    );
    id = result.rows[0].id;
  });

  const ids = (body: { id: number }[]) => body.map((row) => row.id);

  it('hides inactive rows by default, even for admins', async () => {
    const response = await request(app).get(path).set('Cookie', adminCookies);
    expect(response.status).toBe(200);
    expect(ids(response.body)).not.toContain(id);
    expect(
      response.body.every((row: { active: boolean }) => row.active === true),
    ).toBe(true);
  });

  it('returns inactive rows to an admin with the flag', async () => {
    const response = await request(app)
      .get(`${path}?include_inactive=true`)
      .set('Cookie', adminCookies);
    expect(response.status).toBe(200);
    expect(response.body.find((row: { id: number }) => row.id === id)).toEqual(
      expect.objectContaining({ active: false }),
    );
    expect(
      response.body.every(
        (row: { active: unknown }) => typeof row.active === 'boolean',
      ),
    ).toBe(true);
  });

  it('ignores the flag for a non-admin', async () => {
    const response = await request(app)
      .get(`${path}?include_inactive=true`)
      .set('Cookie', userCookies);
    expect(response.status).toBe(200);
    expect(ids(response.body)).not.toContain(id);
  });

  it('lets an admin reactivate the row', async () => {
    const response = await request(app)
      .put(`${path}/${id}`)
      .set('Cookie', adminCookies)
      .send({ active: true });
    expect(response.status).toBe(200);
    expect(response.body.active).toBe(true);

    const list = await request(app).get(path).set('Cookie', userCookies);
    expect(ids(list.body)).toContain(id);
  });

  it('forbids reactivation by a non-admin', async () => {
    const response = await request(app)
      .put(`${path}/${id}`)
      .set('Cookie', userCookies)
      .send({ active: true });
    expect(response.status).toBe(403);
  });
});
