import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as tagModel from '../models/tagModel';
import { CustomRequest } from '../types/express';
import { TagCreateInput, TagUpdateInput } from '../types/tag';
import logger from '../utils/logger';

// Get all tags
export const getTags = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const tags = await tagModel.getTags(pool);
    res.status(200).json(tags);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new tag with the specified name, color, and icon for the authenticated user.
 *
 * Requires an authenticated user session. Accepts name, color, and icon in the request body and persists the tag to the database.
 * @param req Request object containing user session data and tag creation input (name, color, icon)
 * @param res Response object for sending the created tag or error message
 * @param pool Database connection pool
 */
export const createTag = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { name, color, icon } = req.body as TagCreateInput;
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const tag = await tagModel.createTag(pool, name, color, icon);
    res.status(201).json(tag);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Associate one or more tags with a task.
 *
 * Requires an authenticated user session. Accepts a task ID from URL parameters and an array of tag IDs in the request body, then persists the associations to the database.
 * @param req CustomRequest containing taskId in params, tagIds array in body, and authenticated user session
 * @param res Response object for sending the result or error status
 * @param pool Database connection pool for executing the tag association operation
 */
export const addTaskTags = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { taskId } = req.params;
    const { tagIds } = req.body as { tagIds: string[] };
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await tagModel.addTaskTags(pool, taskId, tagIds);
    res.status(200).json(result);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove tag from task
export const removeTaskTag = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { taskId, tagId } = req.params;
    await tagModel.removeTaskTag(pool, taskId, tagId);
    res.status(200).json({ message: 'Tag removed successfully' });
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve all tags associated with a task and return them to the client.
 * @param req Express request object containing the task ID in params; must be a CustomRequest with session data.
 * @param res Express response object used to send the tags array with 200 status or error with 500 status.
 * @param pool Database connection pool used to query task tags.
 */
export const getTaskTags = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { taskId } = req.params;
    const tags = await tagModel.getTaskTags(pool, taskId);
    res.status(200).json(tags);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Modify an existing tag's name, color, or icon.
 * @param req Express request containing tag id in params and TagUpdateInput in body
 * @param res Express response object
 * @param pool Database connection pool
 */
export const updateTag = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body as TagUpdateInput;
    const tag = await tagModel.updateTag(pool, id, name, color, icon);
    res.status(200).json(tag);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Remove a tag by marking it as inactive.
 * @param req Express request object containing the tag ID in params
 * @param res Express response object for sending the deletion result
 * @param pool Database connection pool
 */
export const deleteTag = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    await tagModel.deleteTag(pool, id);
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};
