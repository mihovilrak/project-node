import { Request, Response } from 'express';
import { Pool } from 'pg';
import {
  ProjectTaskFilters,
  ProjectUpdateInput,
  ProjectQueryFilters,
} from '../types/project';
import { ProjectRequest } from '../types/express';
import * as projectModel from '../models/projectModel';
import * as notificationModel from '../models/notificationModel';
import { NotificationType } from '../types/notification';

// Get all projects
export const getProjects = async (
  req: Request<{}, {}, {}, ProjectQueryFilters>,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const { whereParams } = req.query;

    // Backwards compatibility: if whereParams is explicitly provided, pass it through
    let effectiveWhereParams: Record<string, any> | undefined = whereParams;

    // Otherwise, build whereParams from individual query params with an active-only default
    if (!effectiveWhereParams) {
      const builtWhereParams: Record<string, any> = {};

      if (req.query && typeof req.query === 'object') {
        const {
          status_id,
          created_by,
          parent_id
        } = req.query as any;

        if (status_id !== undefined) {
          builtWhereParams.status_id = Number(status_id);
        }
        if (created_by !== undefined) {
          builtWhereParams.created_by = Number(created_by);
        }
        if (parent_id !== undefined) {
          builtWhereParams.parent_id = Number(parent_id);
        }
      }

      // Enforce active-only default when no explicit status filter is supplied
      if (builtWhereParams.status_id === undefined) {
        builtWhereParams.status_id = 1;
      }

      effectiveWhereParams = Object.keys(builtWhereParams).length > 0
        ? builtWhereParams
        : undefined;
    }

    const projects = await projectModel.getProjects(pool, effectiveWhereParams);
    if (projects.length === 0) {
      res.status(200).json([]);
      return;
    }
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a project by ID
export const getProjectById = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get project details
export const getProjectDetails = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a project
export const createProject = async (
  req: ProjectRequest,
  res: Response,
  pool: Pool
): Promise<void> => {
  const {
    name,
    description,
    start_date,
    due_date,
    parent_id
  } = req.body;

  const created_by = req.session.user?.id;

  if (!created_by) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  try {
    const project = await projectModel.createProject(
      pool,
      name,
      description,
      start_date,
      due_date,
      created_by,
      parent_id
    );

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change project status
export const changeProjectStatus = async (
  req: Request<{ id: string }, {}, { status: string }>,
  res: Response,
  pool: Pool
): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await projectModel.changeProjectStatus(pool, id, status);
    if (!result) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a project
export const updateProject = async (
  req: Request<{ id: string }, {}, ProjectUpdateInput>,
  res: Response,
  pool: Pool
): Promise<void> => {
  const { id } = req.params;
  const updates = {
    ...req.body,
    parent_id: req.body.parent_id ? Number(req.body.parent_id) : undefined
  };
  try {
    const result = await projectModel.updateProject(pool, updates, id);
    if (!result) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a project
export const deleteProject = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get project members
export const getProjectMembers = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const { id } = req.params;
    const members = await projectModel.getProjectMembers(pool, id);
    res.status(200).json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add project member
export const addProjectMember = async (
  req: Request<{ id: string }, {}, { userId: string }>,
  res: Response,
  pool: Pool
): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const result = await projectModel.addProjectMember(pool, id, userId);
    if (!result) {
      res.status(404).json({ error: 'Project or user not found' });
      return;
    }
    // Create notification for project creation
    await notificationModel.createProjectMemberNotifications(pool, {
      project_id: parseInt(id),
      action_user_id: parseInt(userId),
      type_id: NotificationType.ProjectMemberAdded
    });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete project member
export const deleteProjectMember = async (
  req: Request<{ id: string }, {}, { userId: string }>,
  res: Response,
  pool: Pool
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get subprojects
export const getSubprojects = async (
  req: Request<{ id: string }>,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const { id } = req.params;
    const subprojects = await projectModel.getSubprojects(pool, id);
    res.status(200).json(subprojects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get tasks by project ID
export const getProjectTasks = async (
  req: Request<{ id: string }, {}, {}, ProjectTaskFilters>,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    const { status, priority, assignee } = req.query;

    const filters: ProjectTaskFilters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignee) filters.assignee = assignee;

    const tasks = await projectModel.getProjectTasks(pool, projectId, filters);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get project statuses
export const getProjectStatuses = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const statuses = await projectModel.getProjectStatuses(pool);
    res.status(200).json(statuses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
