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

// Get all tasks
export const getTasks = async (
  pool: Pool,
  filters?: TaskQueryFilters
): Promise<TaskDetails[]> => {
  let query = 'SELECT * FROM v_tasks';
  const values: any[] = [];
  const conditions: string[] = [];

  // Backwards-compatible support for raw whereParams map
  if (filters?.whereParams && Object.keys(filters.whereParams).length > 0) {
    Object.entries(filters.whereParams).forEach(([param, value]) => {
      conditions.push(`${param} = $${values.length + 1}`);
      values.push(value);
    });
  }

  // Typed filters – these are preferred going forward
  if (filters) {
    const {
      project_id,
      assignee_id,
      holder_id,
      status_id,
      priority_id,
      type_id,
      parent_id
    } = filters;

    if (project_id !== undefined) {
      conditions.push(`project_id = $${values.length + 1}`);
      values.push(project_id);
    }
    if (assignee_id !== undefined) {
      conditions.push(`assignee_id = $${values.length + 1}`);
      values.push(assignee_id);
    }
    if (holder_id !== undefined) {
      conditions.push(`holder_id = $${values.length + 1}`);
      values.push(holder_id);
    }
    if (status_id !== undefined) {
      conditions.push(`status_id = $${values.length + 1}`);
      values.push(status_id);
    }
    if (priority_id !== undefined) {
      conditions.push(`priority_id = $${values.length + 1}`);
      values.push(priority_id);
    }
    if (type_id !== undefined) {
      conditions.push(`type_id = $${values.length + 1}`);
      values.push(type_id);
    }
    if (parent_id !== undefined) {
      conditions.push(`parent_id = $${values.length + 1}`);
      values.push(parent_id);
    }
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  const result: QueryResult<TaskDetails> = await pool.query(query, values);
  return result.rows;
}

// Get a task by ID
export const getTaskById = async (
  pool: Pool,
  id: string
): Promise<TaskDetails | null> => {
  const result: QueryResult<TaskDetails> = await pool.query(
    `SELECT * FROM v_tasks
    WHERE id = $1`,
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
    `SELECT id, name
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

// Get active tasks
export const getActiveTasks = async (
  pool: Pool,
  userId: string
): Promise<TaskDetails[]> => {
  const result: QueryResult<TaskDetails> = await pool.query(
    `SELECT * FROM v_tasks
    WHERE assignee_id = $1
    AND status_name NOT IN ('Done', 'Cancelled', 'Deleted')`,
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
    `SELECT * FROM v_tasks
    WHERE project_id = $1
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
    `SELECT * FROM v_tasks
    WHERE parent_id = $1
    ORDER BY created_on ASC`,
    [parentId]
  );
  return result.rows;
}
