import {
  Project,
  ProjectDetails,
  ProjectMember,
  ProjectStatus,
  ProjectTaskFilters,
  ProjectFilters,
  ProjectTask,
} from '../types/project';
import { Pool, QueryResult } from 'pg';
import { Queryable } from '../utils/transaction';
import { buildUpdateAssignments } from '../utils/sqlUpdate';
import { accessibleProjectsSubquery } from './accessModel';
import {
  Pagination,
  defaultPagination,
  paginationClause,
} from '../utils/pagination';

/**
 * Fetch projects with enriched details including status name, creator name, time estimates, and progress, scoped to user accessibility.
 *
 * Results include status_name, created_by_name, estimated_time, spent_time, and progress from the project_details lateral join. When scopeUserId is provided, results are filtered by projects the user can access, preventing pagination issues from post-filtering. Results are ordered by project ID and respect the provided pagination limits.
 * @param pool Database connection pool
 * @param filters Optional project filters by status, creator, parent, or date ranges
 * @param pagination Pagination parameters with limit and offset
 * @param scopeUserId Optional user ID to scope results to accessible projects; when null or undefined, no access filtering is applied
 */
export const getProjects = async (
  pool: Pool,
  filters: ProjectFilters = {},
  pagination: Pagination = defaultPagination(),
  scopeUserId?: string | null,
): Promise<Project[]> => {
  const values: unknown[] = [];
  const conditions: string[] = [];

  const addCondition = (sql: string, value: unknown) => {
    if (value === undefined) return;
    values.push(value);
    conditions.push(`${sql} $${values.length}`);
  };

  addCondition('p.status_id =', filters.statusId);
  addCondition('p.created_by =', filters.createdBy);
  addCondition('p.parent_id =', filters.parentId);
  addCondition('p.start_date >=', filters.startDateFrom);
  addCondition('p.start_date <=', filters.startDateTo);
  addCondition('p.due_date >=', filters.dueDateFrom);
  addCondition('p.due_date <=', filters.dueDateTo);

  if (scopeUserId != null) {
    values.push(scopeUserId);
    conditions.push(`p.id IN (${accessibleProjectsSubquery(values.length)})`);
  }

  const whereClause =
    conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
  const page = paginationClause(pagination, values.length + 1);
  const query = `SELECT p.id, p.name, p.description, p.start_date, p.end_date, p.due_date, p.parent_id, p.status_id, p.created_by, p.created_on, p.updated_on,
    pd.status_name, pd.created_by_name, pd.estimated_time, pd.spent_time, pd.progress
FROM projects p
LEFT JOIN LATERAL (SELECT status_name, created_by_name, estimated_time, spent_time, progress FROM project_details(p.id)) pd ON true${whereClause}
ORDER BY p.id
${page.clause}`;

  const result: QueryResult<Project> = await pool.query(query, [
    ...values,
    ...page.values,
  ]);
  return result.rows;
};

// Get a project by ID
export const getProjectById = async (
  pool: Pool,
  id: string,
): Promise<Project | null> => {
  const result: QueryResult<Project> = await pool.query(
    `SELECT * FROM projects
    WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

/**
 * Retrieve comprehensive details for a project including members, task counts, and metadata.
 *
 * Returns null when the project does not exist or the query yields no results.
 * @param pool Database connection pool
 * @param id Project identifier
 * @returns Project details object with members and task statistics, or null if not found
 */
export const getProjectDetails = async (
  pool: Pool,
  id: string,
): Promise<ProjectDetails | null> => {
  const result: QueryResult<ProjectDetails> = await pool.query(
    `SELECT * FROM project_details($1)`,
    [id],
  );
  return result.rows[0] || null;
};

// Create a new project
export const createProject = async (
  pool: Pool,
  name: string,
  description: string,
  start_date: Date | null,
  due_date: Date | null,
  created_by: string,
  parent_id?: string,
): Promise<Project> => {
  const result: QueryResult<Project> = await pool.query(
    `INSERT INTO projects
    (name, description, start_date, due_date, created_by, parent_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [name, description, start_date, due_date, created_by, parent_id],
  );
  return result.rows[0];
};

/**
 * Update a project to the specified status, returning a confirmation message or null if the project does not exist.
 *
 * Returns null when the project cannot be found or updated.
 * @param pool Database connection pool
 * @param id Project identifier
 * @param statusId Target status identifier
 */
export const changeProjectStatus = async (
  pool: Pool,
  id: string,
  statusId: number,
): Promise<{ message: string } | null> => {
  const result: QueryResult<{ message: string }> = await pool.query(
    `SELECT * FROM change_project_status($1, $2)`,
    [id, statusId],
  );
  return result.rows[0] || null;
};

export const ALLOWED_PROJECT_UPDATE_KEYS = [
  'name',
  'description',
  'start_date',
  'due_date',
  'parent_id',
  'status_id',
] as const;

/**
 * Update specified project fields and return the count of affected rows.
 *
 * Only fields in ALLOWED_PROJECT_UPDATE_KEYS are applied; returns null if no updates are provided after filtering.
 * @param pool Database connection pool
 * @param updates Partial project data with fields to update
 * @param id Project identifier
 * @returns Number of rows updated or null if no valid updates were filtered
 */
export const updateProject = async (
  pool: Pool,
  updates: Partial<Project>,
  id: string,
): Promise<number | null> => {
  const assignments = buildUpdateAssignments(
    updates as Record<string, unknown>,
    ALLOWED_PROJECT_UPDATE_KEYS,
  );
  if (!assignments) {
    return null;
  }

  const result: QueryResult = await pool.query(
    `UPDATE projects
    SET ${assignments.setClause}
    WHERE id = $${assignments.nextIndex}`,
    [...assignments.values, id],
  );
  return result.rowCount;
};

// Delete a project
export const deleteProject = async (
  pool: Pool,
  id: string,
): Promise<Project | null> => {
  const result: QueryResult<Project> = await pool.query(
    `SELECT * FROM delete_project($1)`,
    [id],
  );
  return result.rows[0] || null;
};

/**
 * Retrieve the members assigned to a project with optional pagination.
 *
 * Results are ordered by user identifier. Pagination defaults to standard limit and zero offset when not specified.
 * @param pool Database connection pool for executing queries.
 * @param projectId The unique identifier of the project.
 * @param pagination Pagination settings for limiting and offsetting result rows.
 * @returns An array of project members with associated user details.
 */
export const getProjectMembers = async (
  pool: Pool,
  projectId: string,
  pagination: Pagination = defaultPagination(),
): Promise<ProjectMember[]> => {
  const page = paginationClause(pagination, 2);
  const result: QueryResult<ProjectMember> = await pool.query(
    `SELECT * FROM get_project_members($1)
     ORDER BY user_id
     ${page.clause}`,
    [projectId, ...page.values],
  );
  return result.rows;
};

/**
 * Retrieve child projects for a given parent project.
 * @param pool Database connection pool
 * @param parentId Unique identifier of the parent project
 * @param pagination Limit and offset for result set pagination
 * @returns Array of child projects sorted by identifier
 */
export const getSubprojects = async (
  pool: Pool,
  parentId: string,
  pagination: Pagination = defaultPagination(),
): Promise<Project[]> => {
  const page = paginationClause(pagination, 2);
  const result: QueryResult<Project> = await pool.query(
    `SELECT * FROM get_subprojects($1)
     ORDER BY id
     ${page.clause}`,
    [parentId, ...page.values],
  );
  return result.rows;
};

// Add project member
export const addProjectMember = async (
  pool: Queryable,
  projectId: string,
  userId: string,
): Promise<ProjectMember | null> => {
  const result: QueryResult<ProjectMember> = await pool.query(
    `INSERT INTO project_users
    (project_id, user_id)
    VALUES ($1, $2)
    RETURNING *`,
    [projectId, userId],
  );
  return result.rows[0] || null;
};

/**
 * Remove a user from a project's membership.
 *
 * Returns the number of rows deleted, or null if no matching membership record exists.
 * @param pool Database connection pool
 * @param projectId The project identifier
 * @param userId The user identifier to remove
 * @returns Number of affected rows, or null if no member was found
 */
export const deleteProjectMember = async (
  pool: Pool,
  projectId: string,
  userId: string,
): Promise<number | null> => {
  const result: QueryResult = await pool.query(
    `DELETE FROM project_users
    WHERE project_id = $1
    AND user_id = $2`,
    [projectId, userId],
  );
  return result.rowCount;
};

const ALLOWED_PROJECT_TASK_FILTER_KEYS = [
  'status',
  'priority',
  'assignee',
] as const;

/**
 * Retrieve tasks for a project with optional filtering and pagination.
 *
 * Returns an empty array if the project ID is empty or null. Filters for status, priority, and assignee are coerced to numeric identifiers; invalid values are treated as null. Results are ordered by creation date and ID in descending order.
 * @param pool Database connection pool for query execution.
 * @param id Project ID to retrieve tasks for.
 * @param filters Optional filters by status, priority, or assignee identifier.
 * @param pagination Optional pagination settings; defaults to standard limit and zero offset.
 * @returns Array of tasks matching the project and filter criteria.
 */
export const getProjectTasks = async (
  pool: Pool,
  id: string,
  filters: ProjectTaskFilters = {},
  pagination: Pagination = defaultPagination(),
): Promise<ProjectTask[]> => {
  const projectId = id != null && id !== '' ? String(id).trim() : null;
  if (!projectId) {
    return [];
  }
  const rawStatus = filters.status != null ? Number(filters.status) : null;
  const rawPriority =
    filters.priority != null ? Number(filters.priority) : null;
  const rawAssignee =
    filters.assignee != null ? Number(filters.assignee) : null;
  const status_id =
    rawStatus != null && !Number.isNaN(rawStatus) ? rawStatus : null;
  const priority_id =
    rawPriority != null && !Number.isNaN(rawPriority) ? rawPriority : null;
  const assignee_id =
    rawAssignee != null && !Number.isNaN(rawAssignee) ? rawAssignee : null;

  const page = paginationClause(pagination, 5);
  const result: QueryResult<ProjectTask> = await pool.query(
    `SELECT * FROM get_tasks(
      p_project_ids => ARRAY[$1::int],
      p_assignee_ids => $2::int[],
      p_status_ids => $3::smallint[],
      p_priority_ids => $4::smallint[]
    )
    ORDER BY created_on DESC, id DESC
    ${page.clause}`,
    [
      projectId,
      assignee_id != null ? [assignee_id] : null,
      status_id != null ? [status_id] : null,
      priority_id != null ? [priority_id] : null,
      ...page.values,
    ],
  );
  return result.rows;
};

// Get project statuses
export const getProjectStatuses = async (
  pool: Pool,
): Promise<ProjectStatus[]> => {
  const result: QueryResult<ProjectStatus> = await pool.query(
    `SELECT id, name, color FROM project_statuses
    ORDER BY id`,
  );
  return result.rows;
};
