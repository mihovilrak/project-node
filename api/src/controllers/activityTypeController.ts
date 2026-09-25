import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as activityTypeModel from '../models/activityTypeModel';
import { parseLookupType } from '../utils/lookupType';

export { getAvailableIcons } from '../utils/lookupType';

/**
 * Return all active activity types ordered by name.
 * @param req Express request object
 * @param res Express response object
 * @param pool Database connection pool
 */
export const getActivityTypes = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  res.status(200).json(await activityTypeModel.getActivityTypes(pool));
};

/**
 * Create an activity type. Name and a #RRGGBB color are required; the optional icon must be one of the available icons.
 * @param req Request with the activity type fields in the body
 * @param res Response object
 * @param pool Database connection pool
 */
export const createActivityType = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const parsed = parseLookupType(req.body, 'create');
  if ('error' in parsed) {
    return res.status(400).json({ error: parsed.error });
  }
  const { values } = parsed;

  const activityType = await activityTypeModel.createActivityType(pool, {
    name: values.name as string,
    description: (values.description as string | null | undefined) ?? null,
    color: values.color as string,
    icon: (values.icon as string | null | undefined) ?? null,
    active: (values.active as boolean | undefined) ?? true,
  });
  res.status(201).json(activityType);
};

/**
 * Update only the provided fields of an activity type. Returns 404 if it does not exist.
 * @param req Request with activity type id as route parameter and update fields in body
 * @param res Response object
 * @param pool Database connection pool
 */
export const updateActivityType = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const parsed = parseLookupType(req.body, 'update');
  if ('error' in parsed) {
    return res.status(400).json({ error: parsed.error });
  }

  const activityType = await activityTypeModel.updateActivityType(
    pool,
    req.params.id,
    parsed.values,
  );
  if (!activityType) {
    return res.status(404).json({ error: 'Activity type not found' });
  }
  res.status(200).json(activityType);
};

/**
 * Soft-delete an active activity type. Returns 404 if it does not exist or is already inactive.
 * @param req Request with the activity type id in params
 * @param res Response object
 * @param pool Database connection pool
 */
export const deleteActivityType = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const result = await activityTypeModel.deleteActivityType(
    pool,
    req.params.id,
  );
  if (!result) {
    return res.status(404).json({ error: 'Activity type not found' });
  }
  res.status(200).json({ message: 'Activity type deleted successfully' });
};
