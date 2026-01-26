// @ts-nocheck - MSW v1 handlers don't have perfect TypeScript support
// MSW v1 API - use rest handlers
const { rest } = require('msw');

/**
 * Default mock data for MSW handlers
 * These can be overridden in individual tests
 */

// Default user data
export const defaultUser = {
  id: 1,
  login: 'testuser',
  name: 'Test',
  surname: 'User',
  email: 'test@example.com',
  role_id: 1,
  status_id: 1,
  created_on: '2025-01-25',
  updated_on: null,
  last_login: null,
  role_name: 'Admin',
  status_name: 'Active',
  status_color: 'green'
};

// Default permissions
export const defaultPermissions = [
  { id: 1, permission: 'VIEW_TASKS', description: 'View tasks' },
  { id: 2, permission: 'EDIT_TASKS', description: 'Edit tasks' },
  { id: 3, permission: 'CREATE_COMMENT', description: 'Create comments' },
  { id: 4, permission: 'MANAGE_USERS', description: 'Manage users' },
  { id: 5, permission: 'MANAGE_PROJECTS', description: 'Manage projects' }
];

// Default project data
export const defaultProject = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description',
  parent_id: null,
  parent_name: null,
  start_date: '2023-01-01',
  due_date: '2023-12-31',
  status_id: 1,
  status_name: 'Active',
  created_by: 1,
  created_by_name: 'Test User',
  created_on: '2023-01-01',
  estimated_time: 40,
  spent_time: 0,
  progress: 0
};

// Default task data
export const defaultTask = {
  id: 1,
  name: 'Test Task',
  project_id: 1,
  project_name: 'Test Project',
  holder_id: 1,
  holder_name: 'Test Holder',
  assignee_id: 2,
  assignee_name: 'Test Assignee',
  parent_id: null,
  parent_name: null,
  description: 'Test Description',
  type_id: 1,
  type_name: 'Feature',
  status_id: 1,
  status_name: 'To Do',
  priority_id: 1,
  priority_name: 'High',
  start_date: '2025-01-25',
  due_date: '2025-02-25',
  end_date: null,
  spent_time: 0,
  progress: 0,
  created_by: 1,
  created_by_name: 'Test Creator',
  created_on: '2025-01-25',
  estimated_time: 8
};

/**
 * Default MSW handlers for all API endpoints
 * These provide default responses that can be overridden in tests
 */
export const handlers = [
  // Auth endpoints
  rest.get('/api/check-session', (req, res, ctx) => {
    return res(ctx.json({ user: defaultUser }));
  }),

  rest.post('/api/login', async (req, res, ctx) => {
    const body = await req.json() as { login: string; password: string };
    if (body.login === 'testuser' && body.password === 'password123') {
      return res(ctx.json({ user: defaultUser }));
    }
    return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }));
  }),

  rest.post('/api/logout', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // User permissions
  rest.get('/api/users/permissions', (req, res, ctx) => {
    return res(ctx.json(defaultPermissions));
  }),

  // Users endpoints
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([defaultUser]));
  }),

  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ ...defaultUser, id: Number(id) }));
  }),

  rest.post('/api/users', async (req, res, ctx) => {
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({ ...defaultUser, ...body, id: Date.now() }));
  }),

  rest.put('/api/users/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({ ...defaultUser, id: Number(id), ...body }));
  }),

  rest.delete('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  rest.patch('/api/users/:id/status', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ ...defaultUser, id: Number(id) }));
  }),

  rest.get('/api/users/:id/roles', (req, res, ctx) => {
    return res(ctx.json(['Admin']));
  }),

  rest.put('/api/users/:id/roles', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // Projects endpoints
  rest.get('/api/projects', (req, res, ctx) => {
    return res(ctx.json([defaultProject]));
  }),

  rest.get('/api/projects/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ ...defaultProject, id: Number(id) }));
  }),

  rest.get('/api/projects/:id/details', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ ...defaultProject, id: Number(id) }));
  }),

  rest.post('/api/projects', async (req, res, ctx) => {
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({ ...defaultProject, ...body, id: Date.now() }));
  }),

  rest.put('/api/projects/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({ ...defaultProject, id: Number(id), ...body }));
  }),

  rest.delete('/api/projects/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  rest.patch('/api/projects/:id/status', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ ...defaultProject, id: Number(id) }));
  }),

  rest.get('/api/projects/:id/members', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.post('/api/projects/:id/members', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json() as { userId: number };
    return res(ctx.json({
      user_id: body.userId,
      project_id: Number(id),
      role: 'Member',
      name: 'Test',
      surname: 'User',
      created_on: new Date().toISOString()
    }));
  }),

  rest.delete('/api/projects/:id/members', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  rest.put('/api/projects/:id/members/:userId', async (req, res, ctx) => {
    const { id, userId } = req.params;
    const body = await req.json() as { role: string };
    return res(ctx.json({
      user_id: Number(userId),
      project_id: Number(id),
      role: body.role,
      name: 'Test',
      surname: 'User',
      created_on: new Date().toISOString()
    }));
  }),

  rest.get('/api/projects/:id/subprojects', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.get('/api/projects/:id/spent-time', (req, res, ctx) => {
    return res(ctx.json(0));
  }),

  rest.get('/api/projects/:id/tasks', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json([{ ...defaultTask, project_id: Number(id) }]));
  }),

  rest.get('/api/projects/statuses', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Active' },
      { id: 2, name: 'Inactive' }
    ]));
  }),

  // Tasks endpoints
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.json([defaultTask]));
  }),

  rest.get('/api/tasks/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ ...defaultTask, id: Number(id) }));
  }),

  rest.post('/api/tasks', async (req, res, ctx) => {
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({ ...defaultTask, ...body, id: Date.now() }));
  }),

  rest.put('/api/tasks/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({ ...defaultTask, id: Number(id), ...body }));
  }),

  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  rest.get('/api/tasks/:id/subtasks', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.get('/api/tasks/calendar', (req, res, ctx) => {
    return res(ctx.json([defaultTask]));
  }),

  rest.patch('/api/tasks/:id/dates', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({ ...defaultTask, id: Number(id), ...body }));
  }),

  rest.get('/api/tasks/active', (req, res, ctx) => {
    return res(ctx.json([defaultTask]));
  }),

  rest.patch('/api/tasks/:id/change-status', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json() as { statusId: number };
    return res(ctx.json({
      ...defaultTask,
      id: Number(id),
      status_id: body.statusId,
      status_name: 'In Progress'
    }));
  }),

  rest.get('/api/tasks/statuses', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'To Do', color: '#FF0000' },
      { id: 2, name: 'In Progress', color: '#00FF00' },
      { id: 3, name: 'Done', color: '#0000FF' }
    ]));
  }),

  rest.get('/api/tasks/priorities', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'High', color: '#FF0000' },
      { id: 2, name: 'Medium', color: '#FFFF00' },
      { id: 3, name: 'Low', color: '#00FF00' }
    ]));
  }),

  rest.put('/api/tasks/:id/tags', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  rest.post('/api/tasks/:id/tags', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.delete('/api/tasks/:id/tags/:tagId', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  rest.get('/api/tasks/:id/tags', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  // Comments endpoints
  rest.get('/api/tasks/:id/comments', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.post('/api/tasks/:id/comments', async (req, res, ctx) => {
    const body = await req.json() as { comment: string };
    return res(ctx.json({
      id: Date.now(),
      task_id: 1,
      comment: body.comment,
      user_id: 1,
      created_on: new Date().toISOString(),
      updated_on: null,
      active: true
    }));
  }),

  rest.put('/api/tasks/:id/comments/:commentId', async (req, res, ctx) => {
    const body = await req.json() as { comment: string };
    return res(ctx.json({
      id: 1,
      task_id: 1,
      comment: body.comment,
      user_id: 1,
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
      active: true
    }));
  }),

  rest.delete('/api/tasks/:id/comments/:commentId', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // Files endpoints
  rest.get('/api/files', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.post('/api/files', async (req, res, ctx) => {
    return res(ctx.json({
      id: 1,
      task_id: 1,
      user_id: 1,
      name: 'test-file.txt',
      original_name: 'test-file.txt',
      size: 1024,
      mime_type: 'text/plain',
      uploaded_by: 'Test User',
      uploaded_on: new Date().toISOString()
    }));
  }),

  rest.get('/api/files/:id/download', (req, res, ctx) => {
    return res(
      ctx.body('test content'),
      ctx.set('content-disposition', 'attachment; filename="test-file.txt"')
    );
  }),

  rest.delete('/api/files/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // Notifications endpoints
  rest.get('/api/notifications/:userId', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.patch('/api/notifications/:userId', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  rest.delete('/api/notifications/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // Time logs endpoints
  rest.get('/api/time-logs', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.get('/api/time-logs/tasks/:id/logs', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.get('/api/time-logs/tasks/:id/spent-time', (req, res, ctx) => {
    return res(ctx.json({ total: 0, hours: 0, minutes: 0 }));
  }),

  rest.get('/api/time-logs/projects/:id/logs', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.get('/api/time-logs/projects/:id/spent-time', (req, res, ctx) => {
    return res(ctx.json({ total: 0, hours: 0, minutes: 0 }));
  }),

  rest.post('/api/time-logs/tasks/:id/logs', async (req, res, ctx) => {
    const body = await req.json() as { log_date: string; spent_time: number; description: string; activity_type_id?: number };
    return res(ctx.json({
      id: Date.now(),
      task_id: 1,
      user_id: 1,
      activity_type_id: body.activity_type_id || 1,
      log_date: body.log_date,
      spent_time: body.spent_time,
      description: body.description,
      created_on: new Date().toISOString(),
      updated_on: null,
      activity_type_name: 'Development',
      activity_type_color: '#4CAF50',
      activity_type_icon: 'code'
    }));
  }),

  rest.get('/api/time-logs/user/logs', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.put('/api/time-logs/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json() as { log_date: string; spent_time: number; description: string; activity_type_id?: number };
    return res(ctx.json({
      id: Number(id),
      task_id: 1,
      user_id: 1,
      activity_type_id: body.activity_type_id || 1,
      log_date: body.log_date,
      spent_time: body.spent_time,
      description: body.description,
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
      activity_type_name: 'Development',
      activity_type_color: '#4CAF50',
      activity_type_icon: 'code'
    }));
  }),

  rest.delete('/api/time-logs/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // Roles endpoints
  rest.get('/api/roles', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Admin', permissions: [1, 2, 3, 4, 5], created_on: '2025-01-25', updated_on: null },
      { id: 2, name: 'Manager', permissions: [1, 2, 3], created_on: '2025-01-25', updated_on: null },
      { id: 3, name: 'User', permissions: [1], created_on: '2025-01-25', updated_on: null }
    ]));
  }),

  rest.post('/api/roles', async (req, res, ctx) => {
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({
      id: Date.now(),
      ...body,
      created_on: new Date().toISOString(),
      updated_on: null
    }));
  }),

  rest.put('/api/roles/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({
      id: Number(id),
      ...body,
      updated_on: new Date().toISOString()
    }));
  }),

  rest.delete('/api/roles/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // Settings endpoints
  rest.get('/api/settings/user_settings', (req, res, ctx) => {
    return res(ctx.json({
      theme: 'light',
      language: 'en',
      notifications: true
    }));
  }),

  rest.put('/api/settings/user_settings', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  rest.get('/api/settings/app_settings', (req, res, ctx) => {
    return res(ctx.json({
      id: 1,
      app_name: 'Project Manager',
      company_name: 'Test Company',
      sender_email: 'noreply@test.com',
      time_zone: 'UTC',
      theme: 'light',
      welcome_message: 'Welcome to Project Manager',
      created_on: '2025-01-26'
    }));
  }),

  rest.put('/api/settings/app_settings', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  rest.post('/api/settings/test-smtp', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      message: 'SMTP test successful'
    }));
  }),

  // Profile endpoints
  rest.get('/api/profile', (req, res, ctx) => {
    return res(ctx.json({
      ...defaultUser,
      total_tasks: 10,
      completed_tasks: 5,
      active_projects: 3,
      total_hours: 40
    }));
  }),

  rest.put('/api/profile', async (req, res, ctx) => {
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({ ...defaultUser, ...body }));
  }),

  rest.put('/api/profile/password', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  rest.get('/api/profile/tasks', (req, res, ctx) => {
    return res(ctx.json([defaultTask]));
  }),

  rest.get('/api/profile/projects', (req, res, ctx) => {
    return res(ctx.json([defaultProject]));
  }),

  // Permissions endpoint
  rest.get('/api/admin/permissions', (req, res, ctx) => {
    return res(ctx.json(defaultPermissions));
  }),

  // Task types endpoints
  rest.get('/api/admin/task-types', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Bug', color: '#ff0000', icon: 'bug', description: 'Software bug', active: true },
      { id: 2, name: 'Feature', color: '#00ff00', icon: 'star', description: 'New feature', active: true }
    ]));
  }),

  rest.get('/api/admin/task-types/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({
      id: Number(id),
      name: 'Bug',
      color: '#ff0000',
      icon: 'bug',
      description: 'Software bug',
      active: true
    }));
  }),

  rest.post('/api/admin/task-types', async (req, res, ctx) => {
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({
      id: Date.now(),
      ...body,
      active: true
    }));
  }),

  rest.put('/api/admin/task-types/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({
      id: Number(id),
      ...body
    }));
  }),

  rest.delete('/api/admin/task-types/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // Activity types endpoints
  rest.get('/api/admin/activity-types', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Development', color: '#4CAF50', icon: 'code', description: 'Software development', active: true },
      { id: 2, name: 'Testing', color: '#2196F3', icon: 'test', description: 'Software testing', active: true }
    ]));
  }),

  rest.post('/api/admin/activity-types', async (req, res, ctx) => {
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({
      id: Date.now(),
      ...body,
      active: true
    }));
  }),

  rest.put('/api/admin/activity-types/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({
      id: Number(id),
      ...body
    }));
  }),

  rest.delete('/api/admin/activity-types/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // Watchers endpoints
  rest.get('/api/tasks/:id/watchers', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.post('/api/tasks/:id/watchers', async (req, res, ctx) => {
    const body = await req.json() as { userId: number };
    return res(ctx.json({
      task_id: 1,
      user_id: body.userId,
      user_name: 'Test Watcher',
      role: 'Developer'
    }));
  }),

  rest.delete('/api/tasks/:id/watchers/:userId', (req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // Tags endpoints
  rest.get('/api/tags', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.post('/api/tags', async (req: any, res: any, ctx: any) => {
    const body = await req.json() as Record<string, any>;
    return res(ctx.json({
      id: Date.now(),
      ...body,
      active: true
    }));
  }),

  // User endpoint (for current user)
  rest.get('/api/user', (req: any, res: any, ctx: any) => {
    return res(ctx.json(defaultUser));
  })
];
