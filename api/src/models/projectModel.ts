import {
  Project,
  ProjectDetails,
  ProjectMember,
  ProjectStatus,
  ProjectTaskFilters
} from '../types/project';
import { Pool, QueryResult } from 'pg';

const ALLOWED_PROJECT_WHERE_KEYS = ['status_id', 'created_by', 'parent_id'] as const;
const RANGE_KEYS = ['start_date_from', 'start_date_to', 'due_date_from', 'due_date_to'] as const;

// Get all projects
export const getProjects = async (
  pool: Pool,
  whereParams?: Record<string, any>
): Promise<Project[]> => {
  let query = 'SELECT * FROM projects';
  const values: any[] = [];
  const conditions: string[] = [];

  if (whereParams && Object.keys(whereParams).length > 0) {
    const allowedEntries = Object.entries(whereParams).filter(([key]) =>
      ALLOWED_PROJECT_WHERE_KEYS.includes(key as typeof ALLOWED_PROJECT_WHERE_KEYS[number])
    );
    for (const [key, value] of allowedEntries) {
      conditions.push(`${key} = $${values.length + 1}`);
      values.push(value);
    }
    const rangeEntries = Object.entries(whereParams).filter(([key]) =>
      RANGE_KEYS.includes(key as typeof RANGE_KEYS[number])
    );
    for (const [key, value] of rangeEntries) {
      if (key === 'start_date_from') {
        conditions.push(`start_date >= $${values.length + 1}`);
        values.push(value);
      } else if (key === 'start_date_to') {
        conditions.push(`start_date <= $${values.length + 1}`);
        values.push(value);
      } else if (key === 'due_date_from') {
        conditions.push(`due_date >= $${values.length + 1}`);
        values.push(value);
      } else if (key === 'due_date_to') {
        conditions.push(`due_date <= $${values.length + 1}`);
        values.push(value);
      }
    }
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  const result: QueryResult<Project> = await pool.query(query, values);
  return result.rows;
}

// Get a project by ID
export const getProjectById = async (
  pool: Pool,
  id: string
): Promise<Project | null> => {
  const result: QueryResult<Project> = await pool.query(
    `SELECT * FROM projects
    WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

// Get project details
export const getProjectDetails = async (
  pool: Pool,
  id: string
): Promise<ProjectDetails | null> => {
  const result: QueryResult<ProjectDetails> = await pool.query(
    `SELECT * FROM project_details($1)`,
    [id]
  );
  return result.rows[0] || null;
}

// Create a new project
export const createProject = async (
  pool: Pool,
  name: string,
  description: string,
  start_date: Date | null,
  due_date: Date | null,
  created_by: string,
  parent_id?: string
): Promise<Project> => {
  const result: QueryResult<Project> = await pool.query(
    `INSERT INTO projects
    (name, description, start_date, due_date, created_by, parent_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [name, description, start_date, due_date, created_by, parent_id]
  );
  return result.rows[0];
}

// Change a project status
export const changeProjectStatus = async (
  pool: Pool,
  id: string,
  status: string
): Promise<Project | null> => {
  const result: QueryResult<Project> = await pool.query(
    `SELECT * FROM change_project_status($1, $2)`,
    [id, status]
  );
  return result.rows[0] || null;
}

const ALLOWED_PROJECT_UPDATE_KEYS = ['name', 'description', 'start_date', 'due_date', 'parent_id', 'status_id'] as const;

// Update a project
export const updateProject = async (
  pool: Pool,
  updates: Partial<Project>,
  id: string
): Promise<number | null> => {
  const filteredEntries = Object.entries(updates).filter(([key]) =>
    ALLOWED_PROJECT_UPDATE_KEYS.includes(key as typeof ALLOWED_PROJECT_UPDATE_KEYS[number])
  );
  if (filteredEntries.length === 0) {
    return null;
  }
  const columns = filteredEntries.map(([k]) => k);
  const values = filteredEntries.map(([, v]) => v);

  let query = `UPDATE projects SET (${columns.join(', ')}) =
  (${columns.map((_, index) => `$${index + 1}`).join(', ')})`;

  query += ` WHERE id = $${columns.length + 1}`;

  values.push(id);

  const result: QueryResult = await pool.query(query, values);
  return result.rowCount;
}

// Delete a project
export const deleteProject = async (
  pool: Pool,
  id: string
): Promise<Project | null> => {
  const result: QueryResult<Project> = await pool.query(
    `SELECT * FROM delete_project($1)`,
    [id]
  );
  return result.rows[0] || null;
}

// Get project members
export const getProjectMembers = async (
  pool: Pool,
  projectId: string
): Promise<ProjectMember[]> => {
  const result: QueryResult<ProjectMember> = await pool.query(
    'SELECT * FROM get_project_members($1)',
    [projectId]
  );
  return result.rows;
}

// Get subprojects
export const getSubprojects = async (
  pool: Pool,
  parentId: string
): Promise<Project[]> => {
  const result: QueryResult<Project> = await pool.query(
    'SELECT * FROM get_subprojects($1)',
    [parentId]
  );
  return result.rows;
}

// Add project member
export const addProjectMember = async (
  pool: Pool,
  projectId: string,
  userId: string
): Promise<ProjectMember | null> => {
  const result: QueryResult<ProjectMember> = await pool.query(
    `INSERT INTO project_users
    (project_id, user_id)
    VALUES ($1, $2)
    RETURNING *`,
    [projectId, userId]
  );
  return result.rows[0] || null;
}

// Delete project member
export const deleteProjectMember = async (
  pool: Pool,
  projectId: string,
  userId: string
): Promise<number | null> => {
  const result: QueryResult = await pool.query(
    `DELETE FROM project_users
    WHERE project_id = $1
    AND user_id = $2`,
    [projectId, userId]
  );
  return result.rowCount;
}

const ALLOWED_PROJECT_TASK_FILTER_KEYS = ['status', 'priority', 'assignee'] as const;

// Get project tasks
export const getProjectTasks = async (
  pool: Pool,
  id: string,
  filters: ProjectTaskFilters = {}
): Promise<any[]> => {
  const status_id = filters.status != null ? Number(filters.status) : null;
  const priority_id = filters.priority != null ? Number(filters.priority) : null;
  const assignee_id = filters.assignee != null ? Number(filters.assignee) : null;

  const result: QueryResult = await pool.query(
    `SELECT * FROM get_tasks(
      null, $1, $2, null, $3, $4, null, null, false,
      null, null, null, null, null, null, null, null, null, false
    )
    ORDER BY created_on DESC`,
    [id, assignee_id, status_id, priority_id]
  );
  return result.rows;
}

// Get project statuses
export const getProjectStatuses = async (
  pool: Pool
): Promise<ProjectStatus[]> => {
  const result: QueryResult<ProjectStatus> = await pool.query(
    `SELECT id, name FROM project_statuses
    ORDER BY id`
  );
  return result.rows;
}
