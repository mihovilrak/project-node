import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as tagModel from '../models/tagModel';

const TAG_KEYS = ['name', 'color', 'icon'] as const;
type TagValues = Partial<Record<(typeof TAG_KEYS)[number], string>>;

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
// Tags may use any MUI icon name, not only the task/activity type list.
const ICON_NAME = /^[A-Za-z0-9]{1,50}$/;
const MAX_SMALLINT = 32767;

const parseTag = (
  body: unknown,
  mode: 'create' | 'update',
): { error: string } | { values: TagValues } => {
  const input = (body && typeof body === 'object' ? body : {}) as Record<
    string,
    unknown
  >;
  const values: TagValues = {};

  for (const key of TAG_KEYS) {
    const value = input[key];
    if (value === undefined || (key === 'icon' && value === '')) continue;
    if (typeof value !== 'string') return { error: `Invalid ${key}` };
    if (key === 'name') {
      const name = value.trim();
      if (!name || name.length > 50) {
        return { error: 'Name is required and must be at most 50 characters' };
      }
      values.name = name;
    } else if (key === 'color' && !HEX_COLOR.test(value)) {
      return { error: 'Invalid color format' };
    } else if (key === 'icon' && !ICON_NAME.test(value)) {
      return { error: 'Invalid icon' };
    } else {
      values[key] = value;
    }
  }

  if (mode === 'create' && (!values.name || !values.color)) {
    return { error: 'Name and color are required' };
  }
  return { values };
};

const parseTagIds = (value: unknown): number[] | null => {
  if (!Array.isArray(value)) return null;
  const ids = value.map(Number);
  return ids.every((id) => Number.isInteger(id) && id > 0 && id <= MAX_SMALLINT)
    ? ids
    : null;
};

// Get all active tags
export const getTags = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  res.status(200).json(await tagModel.getTags(pool));
};

/**
 * Create a tag. Name and a #RRGGBB color are required; the icon defaults to Label.
 * @param req Request with name, color and optional icon in the body
 * @param res Response object
 * @param pool Database connection pool
 */
export const createTag = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const parsed = parseTag(req.body, 'create');
  if ('error' in parsed) {
    return res.status(400).json({ error: parsed.error });
  }
  const { name, color, icon } = parsed.values;
  const tag = await tagModel.createTag(
    pool,
    name as string,
    color as string,
    icon,
  );
  res.status(201).json(tag);
};

/**
 * Attach active tags to the task in the route and return the task's tags.
 * @param req Request with the task id in params and a `tagIds` array in the body
 * @param res Response object
 * @param pool Database connection pool
 */
export const addTaskTags = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const tagIds = parseTagIds((req.body as { tagIds?: unknown })?.tagIds);
  if (!tagIds) {
    return res
      .status(400)
      .json({ error: 'tagIds must be an array of tag ids' });
  }
  await tagModel.addTaskTags(pool, req.params.id, tagIds);
  res.status(200).json(await tagModel.getTaskTags(pool, req.params.id));
};

// Remove a tag from the task in the route
export const removeTaskTag = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const removed = await tagModel.removeTaskTag(
    pool,
    req.params.id,
    req.params.tagId,
  );
  if (!removed) {
    return res.status(404).json({ error: 'Tag is not on this task' });
  }
  res.status(200).json({ message: 'Tag removed successfully' });
};

// List the active tags of the task in the route
export const getTaskTags = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  res.status(200).json(await tagModel.getTaskTags(pool, req.params.id));
};

/**
 * Update only the provided name, color or icon of a tag. Returns 404 if it does not exist.
 * @param req Request with the tag id in params and fields in the body
 * @param res Response object
 * @param pool Database connection pool
 */
export const updateTag = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const parsed = parseTag(req.body, 'update');
  if ('error' in parsed) {
    return res.status(400).json({ error: parsed.error });
  }
  const tag = await tagModel.updateTag(pool, req.params.id, parsed.values);
  if (!tag) {
    return res.status(404).json({ error: 'Tag not found' });
  }
  res.status(200).json(tag);
};

/**
 * Soft-delete an active tag. Returns 404 if it does not exist or is already inactive.
 * @param req Request with the tag id in params
 * @param res Response object
 * @param pool Database connection pool
 */
export const deleteTag = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const tag = await tagModel.deleteTag(pool, req.params.id);
  if (!tag) {
    return res.status(404).json({ error: 'Tag not found' });
  }
  res.status(200).json({ message: 'Tag deleted successfully' });
};
