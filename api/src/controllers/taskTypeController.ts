import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as taskTypeModel from '../models/taskTypeModel';
import { TaskTypeCreateInput, TaskTypeUpdateInput } from '../types/taskType';
import { AVAILABLE_ICONS } from '../utils/iconConstants';
import logger from '../utils/logger';

/**
 * Fetch all active task types and return them as JSON, with error handling for database failures.
 *
 * Retrieves task types from the model, orders them by name, and responds with the result. Logs errors and returns a 500 status with an error message if the database query fails.
 * @param req Express request object
 * @param res Express response object for sending the task types or error message
 * @param pool Database connection pool for querying task types
 */
export const getTaskTypes = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  try {
    const result = await taskTypeModel.getTaskTypes(pool);
    res.json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching task types');
    res.status(500).json({ error: 'Failed to fetch task types' });
  }
};

/**
 * Retrieve a task type by its ID from the database.
 *
 * Returns a 404 status if the task type does not exist. Responds with a 500 status on database errors.
 * @param req Express request object containing the task type ID in params
 * @param res Express response object for sending the result or error
 * @param pool Database connection pool
 */
export const getTaskTypeById = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const result = await taskTypeModel.getTaskTypeById(pool, id);

    if (!result) {
      return res.status(404).json({ error: 'Task type not found' });
    }

    res.json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching task type');
    res.status(500).json({ error: 'Failed to fetch task type' });
  }
};

/**
 * Insert a new task type with validated name, color, and optional description and icon.
 *
 * Requires name and color fields in the request body. Color must be a valid hex format (#RRGGBB). Icon defaults to 'Task' if not provided. Active status defaults to true.
 * @param req Express request object containing task type data in the body
 * @param res Express response object for sending the created task type or error
 * @param pool Database connection pool for persisting the new task type
 */
export const createTaskType = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const {
      name,
      description,
      color,
      icon,
      active = true,
    } = req.body as TaskTypeCreateInput;

    // Validate required fields
    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    // Validate color format
    if (!color.match(/^#[0-9A-Fa-f]{6}$/)) {
      return res.status(400).json({ error: 'Invalid color format' });
    }

    // Provide default icon if not specified (database requires NOT NULL)
    const defaultIcon = icon || 'Task';

    const result = await taskTypeModel.createTaskType(
      pool,
      name,
      description || null,
      color,
      defaultIcon,
      active,
    );

    res.status(201).json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error creating task type');
    res.status(500).json({ error: 'Failed to create task type' });
  }
};

/**
 * Update an existing task type with optional name, description, color, icon, and active status.
 *
 * Validates hex color format (#RRGGBB) when provided. Preserves false values for the active field. Returns 404 if the task type does not exist.
 * @param req Express request containing task type ID in params and update fields in body
 * @param res Express response for sending the updated task type or error status
 * @param pool Database connection pool
 */
export const updateTaskType = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { name, description, color, icon, active } =
      req.body as TaskTypeUpdateInput;

    // Validate color format when provided (must be hex #RRGGBB for DB varchar(7))
    if (color != null && color !== '' && !color.match(/^#[0-9A-Fa-f]{6}$/)) {
      return res.status(400).json({ error: 'Invalid color format' });
    }

    // Use ?? so that active: false is preserved (active || null would turn false into null)
    const activeValue = active ?? true;

    const result = await taskTypeModel.updateTaskType(
      pool,
      id,
      name ?? null,
      description ?? null,
      color ?? null,
      icon ?? null,
      activeValue,
    );

    if (!result) {
      return res.status(404).json({ error: 'Task type not found' });
    }

    res.json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error updating task type');
    res.status(500).json({ error: 'Failed to update task type' });
  }
};

/**
 * Remove a task type by marking it inactive in the database.
 *
 * Returns a 404 error if the task type does not exist. Returns a 500 error if the deletion operation fails.
 * @param req Express request containing the task type id in params
 * @param res Express response object for sending the result
 * @param pool Database connection pool for executing the deletion query
 */
export const deleteTaskType = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const result = await taskTypeModel.deleteTaskType(pool, id);

    if (!result) {
      return res.status(404).json({ error: 'Task type not found' });
    }

    res.json({ message: 'Task type deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting task type');
    res.status(500).json({ error: 'Failed to delete task type' });
  }
};

// Get available icons
export const getAvailableIcons = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    res.status(200).json(AVAILABLE_ICONS);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching icons');
    res.status(500).json({ error: 'Failed to fetch icons' });
  }
};
