import { DatabasePool } from '../types/models';
import { 
  Task, 
  TaskDetails, 
  TaskStatus, 
  TaskPriority,
  TaskCreateInput,
  TaskUpdateInput,
  TaskWatcher,
  TaskQueryFilters
} from '../types/task';
import { QueryResult } from 'pg';

// Get all tasks
export async function getTasks(
  pool: DatabasePool,
  whereParams?: TaskQueryFilters
): Promise<TaskDetails[]> {
  let query = 'SELECT * FROM v_tasks';
  const values: any[] = [];

  if (whereParams && Object.keys(whereParams).length > 0) {
    query += ' WHERE ';
    const conditions: string[] = [];

    Object.keys(whereParams).forEach((param, index) => {
      conditions.push(`${param} = $${index + 1}`);
      values.push(whereParams[param]);
    });

    query += conditions.join(' AND ');
  }

  const result: QueryResult<TaskDetails> = await pool.query(query, values);
  return result.rows;
}

// Get a task by ID
export async function getTaskById(
  pool: DatabasePool,
  id: string
): Promise<TaskDetails | null> {
  const result: QueryResult<TaskDetails> = await pool.query(
    `SELECT * FROM v_tasks 
    WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

// Create a task
export async function createTask(
  pool: DatabasePool,
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
    tagIds
  }: TaskCreateInput,
  watchers: string[]
): Promise<Task> {
  const result: QueryResult<Task> = await pool.query(
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
      parent_id,
      project_id,
      holder_id,
      assignee_id,
      created_by,
      tagIds,
      watchers
    ]
  );
  return result.rows[0];
}

// Update a task
export async function updateTask(
  pool: DatabasePool,
  taskId: string,
  taskData: TaskUpdateInput
): Promise<Task | null> {
  const allowedFields = [
    'name',
    'project_id',
    'holder_id',
    'assignee_id',
    'description',
    'estimated_time',
    'status_id',
    'priority_id',
    'start_date',
    'due_date',
    'end_date'
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
export async function changeTaskStatus(
  pool: DatabasePool,
  id: string,
  statusId: string
): Promise<Task | null> {
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
export async function deleteTask(
  pool: DatabasePool,
  id: string
): Promise<Task | null> {
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
export async function getTaskStatuses(
  pool: DatabasePool
): Promise<TaskStatus[]> {
  const result: QueryResult<TaskStatus> = await pool.query(
    `SELECT id, name 
    FROM task_statuses`
  );
  return result.rows;
}

// Get priorities
export async function getPriorities(
  pool: DatabasePool
): Promise<TaskPriority[]> {
  const result: QueryResult<TaskPriority> = await pool.query(
    `SELECT id, name 
    FROM priorities`
  );
  return result.rows;
}

// Get active tasks
export async function getActiveTasks(
  pool: DatabasePool,
  userId: string
): Promise<TaskDetails[]> {
  const result: QueryResult<TaskDetails> = await pool.query(
    `SELECT * FROM v_tasks 
    WHERE assignee_id = $1
    AND status_name NOT IN ('Done', 'Cancelled', 'Deleted')`,
    [userId]
  );
  return result.rows;
}

// Get tasks by project
export async function getTasksByProject(
  pool: DatabasePool,
  project_id: string
): Promise<TaskDetails[]> {
  const result: QueryResult<TaskDetails> = await pool.query(
    `SELECT * FROM v_tasks 
    WHERE project_id = $1 
    ORDER BY created_on DESC`,
    [project_id]
  );
  return result.rows;
}

// Get subtasks
export async function getSubtasks(
  pool: DatabasePool,
  parentId: string
): Promise<TaskDetails[]> {
  const result: QueryResult<TaskDetails> = await pool.query(
    `SELECT * FROM v_tasks 
    WHERE parent_id = $1 
    ORDER BY created_on ASC`,
    [parentId]
  );
  return result.rows;
}

// Get task watchers
export async function getTaskWatchers(
  pool: DatabasePool,
  taskId: string
): Promise<TaskWatcher[]> {
  const result: QueryResult<TaskWatcher> = await pool.query(
    `SELECT * FROM task_watchers 
    WHERE task_id = $1`,
    [taskId]
  );
  return result.rows;
}

// Add task watcher
export async function addTaskWatcher(
  pool: DatabasePool,
  taskId: string,
  userId: string
): Promise<TaskWatcher | null> {
  const result: QueryResult<TaskWatcher> = await pool.query(
    `INSERT INTO task_watchers (task_id, user_id) 
    VALUES ($1, $2) 
    RETURNING *`,
    [taskId, userId]
  );
  return result.rows[0] || null;
}

// Remove task watcher
export async function removeTaskWatcher(
  pool: DatabasePool,
  taskId: string,
  userId: string
): Promise<number> {
  const result: QueryResult = await pool.query(
    `DELETE FROM task_watchers 
    WHERE task_id = $1 
    AND user_id = $2`,
    [taskId, userId]
  );
  return result.rowCount;
}
