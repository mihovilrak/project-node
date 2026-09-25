/**
 * Captures the manual's screenshots from a running Project Node instance.
 *
 * Seeds demo data through the API (skipped if it already exists), so point it
 * at a throwaway instance, never at production.
 *
 *   DOCS_BASE_URL=http://localhost:3100 DOCS_ADMIN_LOGIN=admin \
 *   DOCS_ADMIN_PASSWORD=... yarn docs:screenshots
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from 'playwright';

const BASE_URL = (process.env.DOCS_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const LOGIN = process.env.DOCS_ADMIN_LOGIN ?? 'admin';
const PASSWORD = process.env.DOCS_ADMIN_PASSWORD;
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../public/screenshots');
const DEMO_PROJECT = 'Website Redesign';

interface Named {
  id: number;
  name: string;
}

interface Seeded {
  projectId: number;
  taskId: number;
}

const api = async <T>(page: Page, method: string, path: string, body?: unknown): Promise<T> => {
  const result = await page.evaluate(
    async ({ method, path, body }) => {
      const res = await fetch(path, {
        method,
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          // Required by the API's CSRF check on mutating requests.
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return { status: res.status, text: await res.text() };
    },
    { method, path, body },
  );
  if (result.status >= 400) {
    throw new Error(`${method} ${path} failed with ${result.status}: ${result.text}`);
  }
  return (result.text ? JSON.parse(result.text) : null) as T;
};

const idOf = (list: Named[], name: string): number => {
  const item = list.find((entry) => entry.name === name);
  if (!item) throw new Error(`Lookup "${name}" not found`);
  return item.id;
};

const day = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const seed = async (page: Page, userId: number): Promise<Seeded> => {
  const projects = await api<Named[]>(page, 'GET', '/api/projects');
  const tasks = await api<(Named & { project_id: number })[]>(page, 'GET', '/api/tasks');
  const existing = projects.find((project) => project.name === DEMO_PROJECT);
  if (existing) {
    const task = tasks.find((entry) => entry.project_id === existing.id);
    if (task) return { projectId: existing.id, taskId: task.id };
  }

  const statuses = await api<Named[]>(page, 'GET', '/api/tasks/statuses');
  const priorities = await api<Named[]>(page, 'GET', '/api/tasks/priorities');
  const types = await api<Named[]>(page, 'GET', '/api/admin/task-types');
  const activities = await api<Named[]>(page, 'GET', '/api/admin/activity-types');

  const createProject = (name: string, description: string, start: number, due: number, parentId?: number) =>
    api<{ id: number }>(page, 'POST', '/api/projects', {
      name,
      description,
      start_date: day(start),
      due_date: day(due),
      parent_id: parentId,
    });

  const website = await createProject(DEMO_PROJECT, 'New public website with a refreshed design system.', -20, 40);
  const mobile = await createProject('Mobile App', 'Companion app for iOS and Android.', -5, 90);
  await createProject('Landing Pages', 'Campaign landing pages for the launch.', -10, 20, website.id);

  const createTask = (
    projectId: number,
    name: string,
    type: string,
    status: string,
    priority: string,
    start: number,
    due: number,
    estimate: number,
  ) =>
    api<{ task_id: number }>(page, 'POST', '/api/tasks', {
      name,
      description: `${name}.`,
      project_id: projectId,
      type_id: idOf(types, type),
      status_id: idOf(statuses, status),
      priority_id: idOf(priorities, priority),
      start_date: day(start),
      due_date: day(due),
      estimated_time: estimate,
      holder_id: userId,
      assignee_id: userId,
    });

  const homepage = await createTask(website.id, 'Design the homepage', 'Feature', 'In Progress', 'High/Should', -6, 4, 16);
  await createTask(website.id, 'Fix navigation on small screens', 'Bug', 'New', 'Urgent/ASAP', 0, 2, 4);
  await createTask(website.id, 'Write the style guide', 'Documentation', 'Review', 'Normal/Could', -8, 1, 8);
  await createTask(website.id, 'Set up analytics', 'Task', 'Done', 'Low/Wont', -15, -10, 3);
  await createTask(mobile.id, 'Research push notification providers', 'Research', 'New', 'Normal/Could', 1, 7, 6);
  await createTask(mobile.id, 'Build the sign-in screen', 'Feature', 'On Hold', 'High/Should', 3, 12, 12);

  const taskId = homepage.task_id;
  await api(page, 'POST', `/api/time-logs/tasks/${taskId}/logs`, {
    log_date: day(-2),
    spent_time: 3.5,
    description: 'First wireframes',
    activity_type_id: idOf(activities, 'Design'),
  });
  await api(page, 'POST', `/api/time-logs/tasks/${taskId}/logs`, {
    log_date: day(-1),
    spent_time: 1,
    description: 'Review with the team',
    activity_type_id: idOf(activities, 'Meeting'),
  });
  await api(page, 'POST', `/api/tasks/${taskId}/comments`, {
    comment: 'Wireframes are ready for review. Feedback welcome by Friday.',
  });

  return { projectId: website.id, taskId };
};

const settle = async (page: Page): Promise<void> => {
  await page.waitForLoadState('networkidle');
  // Let MUI transitions and charts finish animating.
  await page.waitForTimeout(800);
};

const shoot = async (page: Page, path: string, file: string): Promise<void> => {
  await page.goto(`${BASE_URL}${path}`);
  await settle(page);
  await page.screenshot({ path: resolve(OUT_DIR, `${file}.png`) });
  console.log(`captured ${file}.png`);
};

const main = async (): Promise<void> => {
  if (!PASSWORD) throw new Error('Set DOCS_ADMIN_PASSWORD');
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: 'light',
    });
    await context.addInitScript(() => localStorage.setItem('themeMode', 'light'));
    const page = await context.newPage();

    await shoot(page, '/login', 'login');
    await page.getByLabel('Username').fill(LOGIN);
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
    const [login] = await Promise.all([
      page.waitForResponse((res) => res.url().endsWith('/api/login')),
      page.locator('button[type="submit"]').click(),
    ]);
    if (!login.ok()) throw new Error(`Login failed with ${login.status()}`);
    const { user } = (await login.json()) as { user: { id: number } };
    await settle(page);

    const { projectId, taskId } = await seed(page, user.id);

    await shoot(page, '/', 'dashboard');
    await shoot(page, '/projects', 'projects');
    await shoot(page, `/projects/${projectId}`, 'project-details');
    await shoot(page, '/tasks', 'tasks');
    await shoot(page, `/tasks/${taskId}`, 'task-details');
    await shoot(page, `/tasks/${taskId}/time-logs`, 'time-logs');
    await shoot(page, '/calendar', 'calendar');
    await shoot(page, '/notifications', 'notifications');
    await shoot(page, '/users', 'users');
    await shoot(page, '/settings', 'settings');
  } finally {
    await browser.close();
  }
};

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
