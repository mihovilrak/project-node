import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as taskTypeModel from '../models/taskTypeModel';
import { parseLookupType } from '../utils/lookupType';

export { getAvailableIcons } from '../utils/lookupType';

// task_types.icon is NOT NULL
const DEFAULT_ICON = 'TaskAlt';

/**
 * Return all active task types ordered by name.
 *
 * @param req Express request object
 * @param res Express response object
 * @param pool Database connection pool
 */
export const getTaskTypes = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  res.json(await taskTypeModel.getTaskTypes(pool));
};

/**
 * Return a task type by id, or 404 if it does not exist.
 *
 * @param req Express request object containing the task type ID in params
 * @param res Express response object
 * @param pool Database connection pool
 */
export const getTaskTypeById = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const result = await taskTypeModel.getTaskTypeById(pool, req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Task type not found' });
  }
  res.json(result);
};

/**
 * Create a task type. Name and a #RRGGBB color are required; the icon must be
 * one of the available icons and defaults to TaskAlt.
 *
 * @param req Express request object containing task type data in the body
 * @param res Express response object
 * @param pool Database connection pool
 */
export const createTaskType = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const parsed = parseLookupType(req.body, 'create');
  if ('error' in parsed) {
    return res.status(400).json({ error: parsed.error });
  }
  const { values } = parsed;

  const result = await taskTypeModel.createTaskType(pool, {
    name: values.name as string,
    description: (values.description as string | null | undefined) ?? null,
    color: values.color as string,
    icon: (values.icon as string | null | undefined) ?? DEFAULT_ICON,
    active: (values.active as boolean | undefined) ?? true,
  });
  res.status(201).json(result);
};

/**
 * Update only the provided fields of a task type. Returns 404 if it does not
 * exist.
 *
 * @param req Express request containing task type ID in params and update
 *   fields in body
 * @param res Express response object
 * @param pool Database connection pool
 */
export const updateTaskType = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const parsed = parseLookupType(req.body, 'update');
  if ('error' in parsed) {
    return res.status(400).json({ error: parsed.error });
  }
  const updates = { ...parsed.values };
  if (updates.icon === null) updates.icon = DEFAULT_ICON;

  const result = await taskTypeModel.updateTaskType(
    pool,
    req.params.id,
    updates,
  );
  if (!result) {
    return res.status(404).json({ error: 'Task type not found' });
  }
  res.json(result);
};

/**
 * Soft-delete an active task type. Returns 404 if it does not exist or is
 * already inactive.
 *
 * @param req Express request containing the task type id in params
 * @param res Express response object
 * @param pool Database connection pool
 */
export const deleteTaskType = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const result = await taskTypeModel.deleteTaskType(pool, req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Task type not found' });
  }
  res.json({ message: 'Task type deleted successfully' });
};
