import * as adminModel from '../../../models/adminModel';
import * as notificationModel from '../../../models/notificationModel';
import * as permissionModel from '../../../models/permissionModel';
import * as projectModel from '../../../models/projectModel';
import * as settingsModel from '../../../models/settingsModel';
import * as tagModel from '../../../models/tagModel';
import * as taskModel from '../../../models/taskModel';
import {
  cleanupTables,
  seedTestProject,
  seedTestTask,
  seedTestUser,
  testPool,
} from '../setup/integration.setup';

let owner: any;
let admin: any;
let project: any;
let taskId: number;

beforeAll(async () => {
  await cleanupTables([
    'notifications',
    'time_logs',
    'task_tags',
    'watchers',
    'tasks',
    'project_users',
    'projects',
    'session',
    'users',
  ]);

  owner = await seedTestUser();
  admin = (
    await testPool.query(
      `INSERT INTO users (login, email, password, name, surname, role_id, status_id)
       VALUES ('contractadmin', 'contractadmin@example.com', crypt(
         'password123', gen_salt('bf', 12)
       ), 'Contract', 'Admin', (SELECT id FROM roles WHERE name = 'Admin'), 1)
       RETURNING *`,
    )
  ).rows[0];
  project = await seedTestProject(owner.id);
  taskId = (await seedTestTask(project.id, owner.id)).task_id;
});

describe('model/database contracts for previously broken runtime paths', () => {
  it('changes a project to the requested status through the stored function', async () => {
    const result = await projectModel.changeProjectStatus(
      testPool,
      String(project.id),
      2,
    );
    const stored = await projectModel.getProjectById(
      testPool,
      String(project.id),
    );

    expect(result?.message).toContain('inactive');
    expect(stored?.status_id).toBe(2);
  });

  it('soft-deletes tasks with the real Deleted status and excludes them from active results', async () => {
    const deleted = await taskModel.deleteTask(testPool, String(taskId));
    const active = await taskModel.getTasks(testPool);

    expect(deleted?.status_id).toBe(7);
    expect(active).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: taskId })]),
    );
  });

  it('creates tags using columns that exist in the real schema', async () => {
    const tag = await tagModel.createTag(
      testPool,
      `Contract tag ${Date.now()}`,
      '#123456',
    );
    expect(tag).toEqual(expect.objectContaining({ color: '#123456' }));
  });

  it('updates the real email_notifications_enabled user-setting column', async () => {
    const settings = await settingsModel.updateUserSettings(
      testPool,
      String(owner.id),
      { email_notifications_enabled: false },
    );

    expect(settings).toEqual(
      expect.objectContaining({ email_notifications_enabled: false }),
    );
  });

  it('keeps projects_for_user return columns aligned and removes owner/member duplicates', async () => {
    await testPool.query(
      `INSERT INTO project_users (project_id, user_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [project.id, owner.id],
    );

    const result = await testPool.query(
      'SELECT * FROM projects_for_user($1) WHERE id = $2',
      [owner.id, project.id],
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toHaveProperty('parent_id');
    expect(result.rows[0]).toHaveProperty('updated_on');
  });

  it('keeps user_notifications return columns aligned with notification data', async () => {
    const inserted = (
      await testPool.query(
        `INSERT INTO notifications (user_id, type_id, title, message, data)
         VALUES ($1, 1, 'Contract', 'Contract message', '{"source":"test"}')
         RETURNING id`,
        [owner.id],
      )
    ).rows[0];

    const notifications = await notificationModel.getNotificationsByUserId(
      testPool,
      String(owner.id),
    );

    expect(notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: inserted.id, data: { source: 'test' } }),
      ]),
    );
  });

  it('keeps notification creation functions aligned with their declared rows', async () => {
    await testPool.query(
      `INSERT INTO watchers (task_id, user_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [taskId, admin.id],
    );
    await testPool.query(
      `INSERT INTO project_users (project_id, user_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [project.id, admin.id],
    );

    const watcherNotifications =
      await notificationModel.createWatcherNotifications(testPool, {
        task_id: taskId,
        action_user_id: owner.id,
        type_id: 3,
      });
    const projectNotifications =
      await notificationModel.createProjectMemberNotifications(testPool, {
        project_id: project.id,
        action_user_id: owner.id,
        type_id: 6,
      });

    expect(watcherNotifications).toEqual(
      expect.arrayContaining([expect.objectContaining({ user_id: admin.id })]),
    );
    expect(projectNotifications).toEqual(
      expect.arrayContaining([expect.objectContaining({ user_id: admin.id })]),
    );
  });

  it('uses SQL-side timestamp defaults when system-log dates are omitted', async () => {
    await expect(adminModel.getSystemLogs(testPool)).resolves.toEqual(
      expect.any(Array),
    );
  });

  it('returns each permission once for administrators', async () => {
    const permissions = await permissionModel.getUserPermissions(
      testPool,
      String(admin.id),
    );
    const names = permissions.map((permission) => permission.permission);

    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain('Admin');
  });
});
