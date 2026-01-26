import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as tagModel from '../models/tagModel';
import { CustomRequest } from '../types/express';
import { TagCreateInput, TagUpdateInput } from '../types/tag';

// Get all tags
export const getTags = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const tags = await tagModel.getTags(pool);
    res.status(200).json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a tag
export const createTag = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const { name, color, icon } = req.body as TagCreateInput;
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const tag = await tagModel.createTag(pool, name, color, userId, icon);
    res.status(201).json(tag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add tags to task
export const addTaskTags = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
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
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove tag from task
export const removeTaskTag = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const { taskId, tagId } = req.params;
    await tagModel.removeTaskTag(pool, taskId, tagId);
    res.status(200).json({ message: 'Tag removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get task tags
export const getTaskTags = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const { taskId } = req.params;
    const tags = await tagModel.getTaskTags(pool, taskId);
    res.status(200).json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update tag
export const updateTag = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body as TagUpdateInput;
    const tag = await tagModel.updateTag(pool, id, name, color, icon);
    res.status(200).json(tag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete tag
export const deleteTag = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    await tagModel.deleteTag(pool, id);
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
