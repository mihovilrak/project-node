import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as taskTypeModel from '../models/taskTypeModel';
import { TaskTypeCreateInput, TaskTypeUpdateInput } from '../types/taskType';
import { AVAILABLE_ICONS } from '../utils/iconConstants';
import logger from '../utils/logger';

// Task Type Controllers
export const getTaskTypes = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const result = await taskTypeModel.getTaskTypes(pool);
    res.json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching task types');
    res.status(500).json({ error: 'Failed to fetch task types' });
  }
};

// Get task type by ID
export const getTaskTypeById = async (
  req: Request,
  res: Response,
  pool: Pool
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

// Create a task type
export const createTaskType = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const {
      name,
      description,
      color,
      icon,
      active = true
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
      active
    );

    res.status(201).json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error creating task type');
    res.status(500).json({ error: 'Failed to create task type' });
  }
};

// Update a task type
export const updateTaskType = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { name, description, color, icon, active } = req.body as TaskTypeUpdateInput;

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
      activeValue
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

// Delete a task type
export const deleteTaskType = async (
  req: Request,
  res: Response,
  pool: Pool
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
  res: Response
): Promise<Response | void> => {
  try {
    res.status(200).json(AVAILABLE_ICONS);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching icons');
    res.status(500).json({ error: 'Failed to fetch icons' });
  }
};