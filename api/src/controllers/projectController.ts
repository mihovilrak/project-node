import { Request, Response } from 'express';
import { Pool } from 'pg';
import {
  ProjectCreateInput,
  ProjectTaskFilters,
  ProjectUpdateInput,
  ProjectQueryFilters,
} from '../types/project';
import { CustomRequest } from '../types/express';
import * as projectModel from '../models/projectModel';
import { isProjectMember, resolveProjectScope } from '../models/accessModel';
import { hasPermission } from '../models/permissionModel';
import * as notificationModel from '../models/notificationModel';
import { NotificationType } from '../types/notification';
import { parsePagination } from '../utils/pagination';
import { withTransaction } from '../utils/transaction';
import { parsePositiveInteger } from '../utils/requestParsing';
import { sessionUserId } from '../utils/sessionUser';
import { ProjectStatusId } from '../constants/statusIds';
import { mapProjectQueryFilters } from '../mappers/projectFilters';

const MAX_PROJECT_NAME_LENGTH = 500;
const MAX_PROJECT_DESCRIPTION_LENGTH = 5000;

type ParentCheck = { ok: true } | { ok: false; status: number; error: string };

// The caller must be able to see the parent, and for an existing project the
// parent must not be the project itself or one of its descendants.
const checkParent = async (
  pool: Pool,
  req: Request,
  parentId: number,
  projectId?: string,
): Promise<ParentCheck> => {
  const userId = sessionUserId(req as CustomRequest);
  if (
    !(await hasPermission(pool, userId, 'Admin')) &&
    !(await isProjectMember(pool, String(parentId), userId))
  ) {
    return { ok: false, status: 403, error: 'No access to parent project' };
  }
  if (
    projectId !== undefined &&
    (await projectModel.wouldCreateCycle(pool, projectId, parentId))
  ) {
    return {
      ok: false,
      status: 400,
      error: 'A project cannot be its own ancestor',
    };
  }
  return { ok: true };
};

/**
 * Retrieve the projects the user can access, filtered and paginated. Defaults to active projects.
 * @param req Request with optional query filters
 * @param res Express response
 * @param pool Database connection pool
 */
export const getProjects = async (
  req: Request<{}, {}, {}, ProjectQueryFilters>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const filters = mapProjectQueryFilters(req.query);
  if (filters.statusId === undefined) {
    filters.statusId = ProjectStatusId.Active;
  }

  const userId = sessionUserId(req as unknown as CustomRequest);
  // Scoped in the query rather than filtered afterwards, so a page is not
  // silently shortened by rows the user cannot see.
  const projects = await projectModel.getProjects(
    pool,
    filters,
    parsePagination(req.query),
    await resolveProjectScope(pool, userId),
  );
  res.status(200).json(projects);
};

// Get a project by ID
export const getProjectById = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const project = await projectModel.getProjectById(pool, req.params.id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.status(200).json(project);
};

// Get project details including members and task counts
export const getProjectDetails = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const project = await projectModel.getProjectDetails(pool, req.params.id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.status(200).json(project);
};

/**
 * Create a project. The name is required; a parent must be a project the user can access.
 * @param req Request with name, description, start_date, due_date and parent_id in the body
 * @param res Express response
 * @param pool Database connection pool
 */
export const createProject = async (
  req: Request<{}, {}, ProjectCreateInput>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { name, description, start_date, due_date, parent_id } = req.body ?? {};
  const createdBy = sessionUserId(req as unknown as CustomRequest);

  if (typeof name !== 'string' || !name.trim()) {
    res.status(400).json({
      error: 'Invalid request',
      message: 'name is required and must be a non-empty string',
    });
    return;
  }
  const trimmedName = name.trim();
  if (trimmedName.length > MAX_PROJECT_NAME_LENGTH) {
    res.status(400).json({
      error: 'Invalid request',
      message: `name must not exceed ${MAX_PROJECT_NAME_LENGTH} characters`,
    });
    return;
  }
  if (
    description !== undefined &&
    description !== null &&
    typeof description !== 'string'
  ) {
    res.status(400).json({
      error: 'Invalid request',
      message: 'description must be a string',
    });
    return;
  }
  const desc = typeof description === 'string' ? description : '';
  if (desc.length > MAX_PROJECT_DESCRIPTION_LENGTH) {
    res.status(400).json({
      error: 'Invalid request',
      message: `description must not exceed ${MAX_PROJECT_DESCRIPTION_LENGTH} characters`,
    });
    return;
  }

  let parentId: number | null = null;
  if (parent_id !== undefined && parent_id !== null && parent_id !== '') {
    parentId = parsePositiveInteger(parent_id);
    if (parentId === null) {
      res.status(400).json({ error: 'parent_id must be a positive integer' });
      return;
    }
    const check = await checkParent(pool, req as Request, parentId);
    if (!check.ok) {
      res.status(check.status).json({ error: check.error });
      return;
    }
  }

  const project = await projectModel.createProject(
    pool,
    trimmedName,
    desc,
    start_date ?? null,
    due_date ?? null,
    createdBy,
    parentId,
  );
  res.status(201).json(project);
};

/**
 * Update a project's status. Accepts status_id or status in the body.
 * @param req Request with project id in params and status_id or status in body
 * @param res Express response
 * @param pool Database connection pool
 */
export const changeProjectStatus = async (
  req: Request<{ id: string }, {}, { status_id?: number; status?: number }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const statusId = parsePositiveInteger(req.body.status_id ?? req.body.status);
  if (statusId === null) {
    res.status(400).json({ error: 'status_id must be a positive integer' });
    return;
  }
  const result = await projectModel.changeProjectStatus(
    pool,
    req.params.id,
    statusId,
  );
  if (!result) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.status(200).json(result);
};

/**
 * Update project fields. parent_id may be null to detach the project; a new parent must be accessible and must not create a loop.
 * @param req Request with project id in params and ProjectUpdateInput fields in body
 * @param res Express response
 * @param pool Database connection pool
 */
export const updateProject = async (
  req: Request<{ id: string }, {}, ProjectUpdateInput>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { id } = req.params;
  const body = req.body ?? {};
  let parentId: number | null | undefined;
  if (body.parent_id === null || body.parent_id === '') {
    parentId = null;
  } else if (body.parent_id !== undefined) {
    parentId = parsePositiveInteger(body.parent_id);
    if (parentId === null) {
      res.status(400).json({ error: 'parent_id must be a positive integer' });
      return;
    }
    const check = await checkParent(pool, req as Request, parentId, id);
    if (!check.ok) {
      res.status(check.status).json({ error: check.error });
      return;
    }
  }

  const result = await projectModel.updateProject(
    pool,
    { ...body, parent_id: parentId },
    id,
  );
  if (result === null) {
    res.status(400).json({ error: 'No valid fields to update' });
    return;
  }
  if (result === 0) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.status(200).json(result);
};

// Delete a project
export const deleteProject = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const result = await projectModel.deleteProject(pool, req.params.id);
  if (!result) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.status(200).json(result);
};

// Get project members
export const getProjectMembers = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const members = await projectModel.getProjectMembers(
    pool,
    req.params.id,
    parsePagination(req.query),
  );
  res.status(200).json(members);
};

/**
 * Add a user to a project and, in the same transaction, notify every member except the actor (the new member included).
 *
 * An existing membership yields 409 and an unknown project or user 404 (via the error handler).
 * @param req Request with project id in params and userId in body
 * @param res Express response
 * @param pool Database connection pool
 */
export const addProjectMember = async (
  req: Request<{ id: string }, {}, { userId?: unknown }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { id } = req.params;
  const userId = parsePositiveInteger(req.body?.userId);
  if (userId === null) {
    res.status(400).json({ error: 'A numeric userId is required' });
    return;
  }
  const actorId = sessionUserId(req as unknown as CustomRequest);

  const member = await withTransaction(pool, async (client) => {
    const added = await projectModel.addProjectMember(
      client,
      id,
      String(userId),
    );
    await notificationModel.createProjectMemberNotifications(client, {
      project_id: Number(id),
      action_user_id: Number(actorId),
      type_id: NotificationType.ProjectMemberAdded,
    });
    return added;
  });
  res.status(201).json(member);
};

// Remove a user from a project
export const deleteProjectMember = async (
  req: Request<{ id: string }, {}, { userId?: unknown }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const userId = parsePositiveInteger(req.body?.userId);
  if (userId === null) {
    res.status(400).json({ error: 'A numeric userId is required' });
    return;
  }
  const result = await projectModel.deleteProjectMember(
    pool,
    req.params.id,
    String(userId),
  );
  if (!result) {
    res.status(404).json({ error: 'Project member not found' });
    return;
  }
  res.status(200).json(result);
};

// Get child projects of a project
export const getSubprojects = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const subprojects = await projectModel.getSubprojects(
    pool,
    req.params.id,
    parsePagination(req.query),
  );
  res.status(200).json(subprojects);
};

/**
 * Retrieve a project's tasks, optionally filtered by status, priority and assignee, with pagination.
 * @param req Request with project id in params and optional query filters
 * @param res Express response
 * @param pool Database connection pool
 */
export const getProjectTasks = async (
  req: Request<{ id: string }, {}, {}, ProjectTaskFilters>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { status, priority, assignee } = req.query;
  const filters: ProjectTaskFilters = {};
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (assignee) filters.assignee = assignee;

  const tasks = await projectModel.getProjectTasks(
    pool,
    req.params.id,
    filters,
    parsePagination(req.query),
  );
  res.status(200).json(tasks);
};

// Get all project statuses
export const getProjectStatuses = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const statuses = await projectModel.getProjectStatuses(pool);
  res.status(200).json(statuses);
};
