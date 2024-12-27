import { DatabasePool } from '../types/models';
import { 
  Project, 
  ProjectDetails, 
  ProjectMember, 
  ProjectStatus,
  ProjectTaskFilters
} from '../types/project';
import { QueryResult } from 'pg';

// Get all projects
export const getProjects = async (
  pool: DatabasePool,
  whereParams?: Record<string, any>
): Promise<Project[]> => {
  let query = 'SELECT * FROM projects';
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

  const result: QueryResult<Project> = await pool.query(query, values);
  return result.rows;
}

// Get a project by ID
export const getProjectById = async (
  pool: DatabasePool,
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
  pool: DatabasePool,
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
  pool: DatabasePool,
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
  pool: DatabasePool,
  id: string,
  status: string
): Promise<Project | null> => {
  const result: QueryResult<Project> = await pool.query(
    `SELECT * FROM change_project_status($1, $2)`,
    [id, status]
  );
  return result.rows[0] || null;
}

// Update a project
export const updateProject = async (
  pool: DatabasePool,
  updates: Partial<Project>,
  id: string
): Promise<number | null> => {
  const columns = Object.keys(updates);
  const values = Object.values(updates);
  
  let query = `UPDATE projects SET (${columns.join(', ')}) = 
  (${columns.map((_, index) => `$${index + 1}`).join(', ')})`;
  
  query += ` WHERE id = $${columns.length + 1}`;
  
  values.push(id);
  
  const result: QueryResult = await pool.query(query, values);
  return result.rowCount;
}

// Delete a project
export const deleteProject = async (
  pool: DatabasePool,
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
  pool: DatabasePool,
  projectId: string
): Promise<ProjectMember[]> => {
  const result: QueryResult<ProjectMember> = await pool.query(
    `SELECT * FROM v_project_members 
    WHERE project_id = $1`,
    [projectId]
  );
  return result.rows;
}

// Get subprojects
export const getSubprojects = async (
  pool: DatabasePool,
  parentId: string
): Promise<Project[]> => {
  const result: QueryResult<Project> = await pool.query(
    `SELECT * FROM v_subprojects 
    WHERE parent_id = $1`,
    [parentId]
  );
  return result.rows;
}

// Add project member
export const addProjectMember = async (
  pool: DatabasePool,
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
  pool: DatabasePool,
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

// Get project tasks
export const getProjectTasks = async (
  pool: DatabasePool,
  id: string,
  filters: ProjectTaskFilters = {}
): Promise<any[]> => {
  const query = `
    SELECT * FROM v_tasks 
    WHERE project_id = $1 
    ${Object.keys(filters).length > 0 
      ? `AND ${Object.keys(filters).map((key, index) => `${key} = $${index + 2}`).join(' AND ')}` 
      : ''}
    ORDER BY created_on DESC
  `;
  
  const values = [id, ...Object.values(filters)];
  const result: QueryResult = await pool.query(query, values);
  return result.rows;
}

// Get project statuses
export const getProjectStatuses = async (
  pool: DatabasePool
): Promise<ProjectStatus[]> => {
  const result: QueryResult<ProjectStatus> = await pool.query(
    `SELECT id, name FROM project_statuses 
    ORDER BY id`
  );
  return result.rows;
}
