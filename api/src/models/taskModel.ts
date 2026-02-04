import {
  Task,
  TaskDetails,
  TaskStatus,
  TaskPriority,
  TaskCreateInput,
  TaskUpdateInput,
  TaskQueryFilters
} from '../types/task';
import { Pool, QueryResult } from 'pg';

// Active task status IDs: New (1), In Progress (2), On Hold (3), Review (4). Excludes Done, Cancelled, Deleted.
const ACTIVE_TASK_STATUS_IDS = [1, 2, 3, 4];

// Get all tasks (get_tasks params include date ranges and created_by)
export const getTasks = async (
  pool: Pool,
  filters?: TaskQueryFilters
): Promise<TaskDetails[]> => {
  const whereParams = filters?.whereParams ?? {};
  const id = filters?.id ?? whereParams.id ?? null;
  const project_id = filters?.project_id ?? whereParams.project_id ?? null;
  const assignee_id = filters?.assignee_id ?? whereParams.assignee_id ?? null;
  const holder_id = filters?.holder_id ?? whereParams.holder_id ?? null;
  const status_id = filters?.status_id ?? whereParams.status_id ?? null;
  const priority_id = filters?.priority_id ?? whereParams.priority_id ?? null;
  const type_id = filters?.type_id ?? whereParams.type_id ?? null;
  const parent_id = filters?.parent_id ?? whereParams.parent_id ?? null;
  const created_by = filters?.created_by ?? whereParams.created_by ?? null;
  const due_date_from = filters?.due_date_from ?? whereParams.due_date_from ?? null;
  const due_date_to = filters?.due_date_to ?? whereParams.due_date_to ?? null;
  const start_date_from = filters?.start_date_from ?? whereParams.start_date_from ?? null;
  const start_date_to = filters?.start_date_to ?? whereParams.start_date_to ?? null;
  const created_from = filters?.created_from ?? whereParams.created_from ?? null;
  const created_to = filters?.created_to ?? whereParams.created_to ?? null;
  const estimated_time_min = filters?.estimated_time_min ?? whereParams.estimated_time_min ?? null;
  const estimated_time_max = filters?.estimated_time_max ?? whereParams.estimated_time_max ?? null;
  const inactive_statuses_only = Boolean(filters?.inactive_statuses_only ?? whereParams.inactive_statuses_only);
  const hasFilters = filters != null && [
    id, project_id, assignee_id, holder_id, status_id, priority_id, type_id, parent_id,
    created_by, due_date_from, due_date_to, start_date_from, start_date_to,
    created_from, created_to, estimated_time_min, estimated_time_max, inactive_statuses_only
  ].some((v) => v != null);
  const explicit_active_only = Boolean(filters?.active_statuses_only ?? whereParams.active_statuses_only);
  const active_statuses_only = explicit_active_only || (!hasFilters && !inactive_statuses_only);

  const result: QueryResult<TaskDetails> = await pool.query(
    `SELECT * FROM get_tasks($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
    [
      id ?? null, project_id, assignee_id, holder_id, status_id, priority_id, type_id, parent_id,
      active_statuses_only,
      created_by ?? null, due_date_from ?? null, due_date_to ?? null,
      start_date_from ?? null, start_date_to ?? null,
      created_from ?? null, created_to ?? null,
      estimated_time_min ?? null, estimated_time_max ?? null,
      inactive_statuses_only
    ]
  );
  return result.rows;
}

// Get a task by ID
export const getTaskById = async (
  pool: Pool,
  id: string
): Promise<TaskDetails | null> => {
  const result: QueryResult<TaskDetails> = await pool.query(
    'SELECT * FROM get_tasks($1, null, null, null, null, null, null, null, false, null, null, null, null, null, null, null, null, null, false)',
    [id]
  );
  return result.rows[0] || null;
}

// Create a task
export const createTask = async (
  pool: Pool,
  {
    name,
    description,
    estimated_time,
    start_date,
    due_date,
    priority_id,
    status_id,
    type_id,
    parent_id,
    project_id,
    holder_id,
    assignee_id,
    created_by,
    tag_ids
  }: TaskCreateInput,
  watchers: number[]
): Promise<{ task_id: number }> => {
  const result = await pool.query<{ task_id: number }>(
    `SELECT * FROM create_task (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15
    )`,
    [
      name,
      description,
      estimated_time,
      start_date,
      due_date,
      priority_id,
      status_id,
      type_id,
      parent_id ?? null,
      project_id,
      holder_id ?? null,
      assignee_id ?? null,
      created_by,
      tag_ids,
      watchers
    ]
  );

  if (!result.rows[0]) {
    throw new Error('Task creation failed - no task ID returned');
  }

  return result.rows[0];
}

// Update a task
export const updateTask = async (
  pool: Pool,
  taskId: string,
  taskData: TaskUpdateInput
): Promise<Task | null> => {
  const allowedFields = [
    'name',
    'project_id',
    'holder_id',
    'assignee_id',
    'description',
    'estimated_time',
    'status_id',
    'type_id',
    'priority_id',
    'start_date',
    'due_date',
    'end_date',
    'progress'
  ] as const;

  // Filter out undefined values and invalid fields
  const updates = Object.entries(taskData)
    .filter(([key, value]) => allowedFields.includes(key as keyof TaskUpdateInput) && value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  if (Object.keys(updates).length === 0) {
    return null;
  }

  const setClause = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  const result: QueryResult<Task> = await pool.query(
    `UPDATE tasks
     SET ${setClause}
     WHERE id = $${Object.keys(updates).length + 1}
     RETURNING *`,
    [...Object.values(updates), taskId]
  );

  return result.rows[0] || null;
}

// Change a task status
export const changeTaskStatus = async (
  pool: Pool,
  id: number,
  statusId: number
): Promise<Task | null> => {
  const result: QueryResult<Task> = await pool.query(
    `UPDATE tasks
    SET (status_id, updated_on) = ($1, CURRENT_TIMESTAMP)
    WHERE id = $2
    RETURNING *`,
    [statusId, id]
  );
  return result.rows[0] || null;
}

// Delete a task
export const deleteTask = async (
  pool: Pool,
  id: string
): Promise<Task | null> => {
  const result: QueryResult<Task> = await pool.query(
    `UPDATE tasks
    SET (status_id, updated_on) = (3, CURRENT_TIMESTAMP)
    WHERE id = $1
    RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

// Get task statuses
export const getTaskStatuses = async (
  pool: Pool
): Promise<TaskStatus[]> => {
  const result: QueryResult<TaskStatus> = await pool.query(
    `SELECT id, name, color
    FROM task_statuses`
  );
  return result.rows;
}

// Get priorities
export const getPriorities = async (
  pool: Pool
): Promise<TaskPriority[]> => {
  const result: QueryResult<TaskPriority> = await pool.query(
    `SELECT id, name, color
    FROM priorities`
  );
  return result.rows;
}

// Get active tasks (assignee_id + active statuses only)
export const getActiveTasks = async (
  pool: Pool,
  userId: string
): Promise<TaskDetails[]> => {
  const result: QueryResult<TaskDetails> = await pool.query(
    'SELECT * FROM get_tasks(null, null, $1, null, null, null, null, null, true, null, null, null, null, null, null, null, null, null, false)',
    [userId]
  );
  return result.rows;
}

// Get tasks by project
export const getTasksByProject = async (
  pool: Pool,
  project_id: string
): Promise<TaskDetails[]> => {
  const result: QueryResult<TaskDetails> = await pool.query(
    `SELECT * FROM get_tasks(null, $1, null, null, null, null, null, null, false, null, null, null, null, null, null, null, null, null, false)
     ORDER BY created_on DESC`,
    [project_id]
  );
  return result.rows;
}

// Get subtasks
export const getSubtasks = async (
  pool: Pool,
  parentId: string
): Promise<TaskDetails[]> => {
  const result: QueryResult<TaskDetails> = await pool.query(
    `SELECT * FROM get_tasks(null, null, null, null, null, null, null, $1, false, null, null, null, null, null, null, null, null, null, false)
     ORDER BY created_on ASC`,
    [parentId]
  );
  return result.rows;
}
