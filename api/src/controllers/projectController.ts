import { Request, Response } from 'express';
import { Pool } from 'pg';
import {
  ProjectTaskFilters,
  ProjectUpdateInput,
  ProjectQueryFilters,
} from '../types/project';
import { CustomRequest, ProjectRequest } from '../types/express';
import * as projectModel from '../models/projectModel';
import { resolveProjectScope } from '../models/accessModel';
import * as notificationModel from '../models/notificationModel';
import { NotificationType } from '../types/notification';
import logger from '../utils/logger';
import { parsePagination } from '../utils/pagination';
import { withTransaction } from '../utils/transaction';
import { ProjectStatusId } from '../constants/statusIds';
import { mapProjectQueryFilters } from '../mappers/projectFilters';

/**
 * Retrieve all projects accessible to the authenticated user, filtered and paginated according to query parameters.
 *
 * Defaults to active projects if no status filter is provided. Scopes results to projects the user can access and applies pagination within the scoped dataset to prevent silently shortened pages. Requires authentication.
 * @param req Request object with optional query filters for status, creator, parent project, and date ranges
 * @param res Response object to send the projects list or error
 * @param pool Database connection pool
 */
export const getProjects = async (
  req: Request<{}, {}, {}, ProjectQueryFilters>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  try {
    const filters = mapProjectQueryFilters(req.query);
    if (filters.statusId === undefined) {
      filters.statusId = ProjectStatusId.Active;
    }

    const userId = (req as unknown as CustomRequest).session?.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Scoped in the query rather than filtered afterwards, so a page is not
    // silently shortened by rows the user cannot see.
    const projects = await projectModel.getProjects(
      pool,
      filters,
      parsePagination(req.query),
      await resolveProjectScope(pool, userId),
    );
    res.status(200).json(projects);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching projects');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve a single project by its identifier.
 * @param req Express request object containing the project ID in the URL parameters
 * @param res Express response object for sending the project data or error status
 * @param pool Database connection pool for querying project information
 */
export const getProjectById = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await projectModel.getProjectById(pool, id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.status(200).json(project);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching project by ID');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve comprehensive project details including members, task counts, and metadata by project ID.
 * @param req Request object with project ID in URL parameters
 * @param res Response object to send project details or error status
 * @param pool Database connection pool for executing queries
 */
export const getProjectDetails = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await projectModel.getProjectDetails(pool, id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.status(200).json(project);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching project details');
    res.status(500).json({ error: 'Internal server error' });
  }
};

const MAX_PROJECT_NAME_LENGTH = 500;
const MAX_PROJECT_DESCRIPTION_LENGTH = 5000;

/**
 * Create a new project with validation for name, description, and optional dates.
 *
 * Requires an authenticated user. The project name is mandatory, must be a non-empty string, and cannot exceed the maximum length limit. Description is optional but cannot exceed the maximum length limit. Start date, due date, and parent project ID are optional. Returns the created project on success with HTTP 201 status.
 * @param req ProjectRequest containing body with name, description, start_date, due_date, and parent_id, along with authenticated user session
 * @param res Response object for sending project data or error messages
 * @param pool Database connection pool for executing queries
 */
export const createProject = async (
  req: ProjectRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { name, description, start_date, due_date, parent_id } = req.body ?? {};

  const created_by = req.session.user?.id;

  if (!created_by) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

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

  try {
    const project = await projectModel.createProject(
      pool,
      trimmedName,
      desc,
      start_date ?? null,
      due_date ?? null,
      created_by,
      parent_id,
    );

    res.status(201).json(project);
  } catch (error) {
    logger.error({ err: error }, 'Error creating project');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update a project's status by ID, validating that the status identifier is a positive integer.
 *
 * Accepts status_id or status in the request body, coercing to a number and rejecting values that are not positive integers. Returns 404 if the project is not found, 400 if status validation fails, and 500 on database errors.
 * @param req Request object with project id in params and status_id or status in body
 * @param res Response object for sending the operation result or error
 * @param pool Database connection pool for executing the status update
 */
export const changeProjectStatus = async (
  req: Request<{ id: string }, {}, { status_id?: number; status?: number }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { id } = req.params;
  const statusId = Number(req.body.status_id ?? req.body.status);
  if (!Number.isInteger(statusId) || statusId < 1) {
    res.status(400).json({ error: 'status_id must be a positive integer' });
    return;
  }
  try {
    const result = await projectModel.changeProjectStatus(pool, id, statusId);
    if (!result) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error changing project status');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Modify project fields and return the updated project, or respond with 404 if not found.
 *
 * Coerces parent_id from string to number if provided. Returns 200 with updated project data on success, 404 if the project does not exist, or 500 on server error.
 * @param req Express request with project id in params and ProjectUpdateInput fields (name, description, start_date, due_date, status, parent_id) in body
 * @param res Express response to send the updated project or error
 * @param pool Database connection pool for executing the update query
 */
export const updateProject = async (
  req: Request<{ id: string }, {}, ProjectUpdateInput>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { id } = req.params;
  const updates = {
    ...req.body,
    parent_id: req.body.parent_id ? Number(req.body.parent_id) : undefined,
  };
  try {
    const result = await projectModel.updateProject(pool, updates, id);
    if (!result) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error updating project');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Remove a project from the database by its identifier.
 *
 * Returns a 404 response if the project does not exist. Returns a 500 response on internal server errors.
 * @param req Express request with project id in route parameters
 * @param res Express response to send the deletion result or error
 * @param pool Database connection pool for executing the delete operation
 */
export const deleteProject = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await projectModel.deleteProject(pool, id);
    if (!result) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error deleting project');
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get project members
export const getProjectMembers = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  try {
    const { id } = req.params;
    const members = await projectModel.getProjectMembers(
      pool,
      id,
      parsePagination(req.query),
    );
    res.status(200).json(members);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching project members');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Add a user to a project and notify all members atomically.
 *
 * Membership and notification creation are performed within a single transaction to ensure that a failed notification does not leave a member unannounced. Returns a 404 response if the project or user does not exist.
 * @param req Request object with project id in params and userId in body
 * @param res Response object for sending HTTP responses
 * @param pool Database connection pool
 */
export const addProjectMember = async (
  req: Request<{ id: string }, {}, { userId: string }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    // Membership and its notifications are one unit of work: a failed
    // notification must not leave a silently unannounced member behind.
    const result = await withTransaction(pool, async (client) => {
      const member = await projectModel.addProjectMember(client, id, userId);
      if (!member) {
        return null;
      }
      await notificationModel.createProjectMemberNotifications(client, {
        project_id: parseInt(id),
        action_user_id: parseInt(userId),
        type_id: NotificationType.ProjectMemberAdded,
      });
      return member;
    });

    if (!result) {
      res.status(404).json({ error: 'Project or user not found' });
      return;
    }
    res.status(201).json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error adding project member');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Remove a user from a project's membership list.
 * @param req Express request with project id in params and userId in body
 * @param res Express response object
 * @param pool Database connection pool
 */
export const deleteProjectMember = async (
  req: Request<{ id: string }, {}, { userId: string }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const result = await projectModel.deleteProjectMember(pool, id, userId);
    if (!result) {
      res.status(404).json({ error: 'Project member not found' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error deleting project member');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve child projects for a given parent project with pagination support.
 * @param req Request object with parent project ID in route parameters
 * @param res Response object for sending subprojects data
 * @param pool Database connection pool
 */
export const getSubprojects = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  try {
    const { id } = req.params;
    const subprojects = await projectModel.getSubprojects(
      pool,
      id,
      parsePagination(req.query),
    );
    res.status(200).json(subprojects);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching subprojects');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve tasks associated with a project, with optional filtering by status, priority, and assignee.
 *
 * Accepts query parameters for status, priority, and assignee to filter results. Supports pagination through query parameters. Returns paginated task results with HTTP 200 on success or HTTP 500 on server error.
 * @param req Express request with project ID in path parameters and optional query filters for status, priority, assignee, and pagination
 * @param res Express response object for sending task results or error messages
 * @param pool Database connection pool for executing queries
 */
export const getProjectTasks = async (
  req: Request<{ id: string }, {}, {}, ProjectTaskFilters>,
  res: Response,
  pool: Pool,
): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    const { status, priority, assignee } = req.query;

    const filters: ProjectTaskFilters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignee) filters.assignee = assignee;

    const tasks = await projectModel.getProjectTasks(
      pool,
      projectId,
      filters,
      parsePagination(req.query),
    );
    res.status(200).json(tasks);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching project tasks');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve all available project status definitions.
 * @param req Express request object
 * @param res Express response object for sending the status list
 * @param pool Database connection pool for querying project statuses
 */
export const getProjectStatuses = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  try {
    const statuses = await projectModel.getProjectStatuses(pool);
    res.status(200).json(statuses);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching project statuses');
    res.status(500).json({ error: 'Internal server error' });
  }
};
