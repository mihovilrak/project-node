import { PoolClient } from 'pg';
import { Express } from 'express';
import request from '../setup/request';
import {
  cleanupTables,
  loginAs,
  seedTestUser,
} from '../setup/integration.setup';
import {
  appPool,
  inRollback,
  insertProject,
  insertTask,
  insertUser,
} from '../setup/db.helpers';

const typeId = (name: string) =>
  `(select id from notification_types where name = '${name}')`;

const setPrefs = (
  client: PoolClient,
  userId: number,
  inApp: boolean,
  email: boolean,
) =>
  client.query(
    `update user_settings
     set notifications_enabled = $2, email_notifications_enabled = $3
     where user_id = $1`,
    [userId, inApp, email],
  );

const notificationsOf = async (client: PoolClient, userId: number) =>
  (
    await client.query('select * from notifications where user_id = $1', [
      userId,
    ])
  ).rows;

const claimedFor = async (client: PoolClient, userId: number) =>
  (
    await client.query(
      'select * from get_notifications_for_service(1000, 5::int2) where user_id = $1',
      [userId],
    )
  ).rows;

describe('PUT /api/settings/user_settings notification flags', () => {
  let app: Express;
  let cookies = '';

  beforeAll(async () => {
    app = (await import('../../../app')).default;
    await cleanupTables(['session', 'users']);
    await seedTestUser();
    cookies = await loginAs(app, 'testuser');
  });

  const put = (body: object) =>
    request(app)
      .put('/api/settings/user_settings')
      .set('Cookie', cookies)
      .send(body);

  it('updates one flag without touching the other', async () => {
    await put({ theme: 'dark' });

    const inApp = await put({ notifications_enabled: false });
    expect(inApp.status).toBe(200);
    expect(inApp.body).toMatchObject({
      theme: 'dark',
      notifications_enabled: false,
      email_notifications_enabled: true,
    });

    const email = await put({ email_notifications_enabled: false });
    expect(email.body).toMatchObject({
      notifications_enabled: false,
      email_notifications_enabled: false,
    });

    const both = await put({ notifications_enabled: true });
    expect(both.body).toMatchObject({
      theme: 'dark',
      notifications_enabled: true,
      email_notifications_enabled: false,
    });
  });

  it('rejects a non-boolean flag', async () => {
    const response = await put({ notifications_enabled: 'no' });
    expect(response.status).toBe(400);
  });
});

describe('notifications_enabled = false', () => {
  it('suppresses create_notification and the task trigger', async () => {
    await inRollback(appPool, async (client) => {
      const owner = await insertUser(client);
      const user = await insertUser(client);
      await setPrefs(client, user.id, false, true);

      await client.query(
        `select create_notification($1, ${typeId('Task Assigned')}, 't', 'm', null)`,
        [user.id],
      );
      const project = await insertProject(client, owner.id);
      const task = await insertTask(client, project.id, owner.id);
      await client.query('update tasks set assignee_id = $1 where id = $2', [
        user.id,
        task.id,
      ]);

      expect(await notificationsOf(client, user.id)).toEqual([]);
    });
  });

  it('suppresses fan-out for that recipient only', async () => {
    await inRollback(appPool, async (client) => {
      const actor = await insertUser(client);
      const muted = await insertUser(client);
      const other = await insertUser(client);
      await setPrefs(client, muted.id, false, true);

      const { rows } = await client.query(
        `select * from fan_out_notifications($1, $2, ${typeId('Task Comment')}, 'x', null)`,
        [[muted.id, other.id], actor.id],
      );

      expect(rows.map((row) => row.user_id)).toEqual([other.id]);
    });
  });

  it('suppresses due-soon notifications', async () => {
    await inRollback(appPool, async (client) => {
      const owner = await insertUser(client);
      const user = await insertUser(client);
      await setPrefs(client, user.id, false, true);
      const project = await insertProject(client, owner.id);
      const task = await insertTask(client, project.id, owner.id, {
        assignee_id: user.id,
      });
      await client.query(
        'update tasks set start_date = current_date, due_date = current_date where id = $1',
        [task.id],
      );

      await client.query('select create_due_soon_notifications()');

      expect(await notificationsOf(client, user.id)).toEqual([]);
    });
  });

  it('keeps earlier notifications out of the email queue', async () => {
    await inRollback(appPool, async (client) => {
      const user = await insertUser(client);
      await client.query(
        `select create_notification($1, ${typeId('Task Assigned')}, 't', 'm', null)`,
        [user.id],
      );
      await setPrefs(client, user.id, false, true);

      expect(await notificationsOf(client, user.id)).toHaveLength(1);
      expect(await claimedFor(client, user.id)).toEqual([]);
    });
  });
});

describe('email_notifications_enabled = false', () => {
  it('keeps in-app notifications but never emails them', async () => {
    await inRollback(appPool, async (client) => {
      const user = await insertUser(client);
      await setPrefs(client, user.id, true, false);

      await client.query(
        `select create_notification($1, ${typeId('Task Assigned')}, 't', 'm', null)`,
        [user.id],
      );

      expect(await notificationsOf(client, user.id)).toHaveLength(1);
      expect(await claimedFor(client, user.id)).toEqual([]);
    });
  });

  it('emails users who left both flags on', async () => {
    await inRollback(appPool, async (client) => {
      const user = await insertUser(client);
      await client.query(
        `select create_notification($1, ${typeId('Task Assigned')}, 't', 'm', null)`,
        [user.id],
      );

      expect(await claimedFor(client, user.id)).toHaveLength(1);
    });
  });
});
