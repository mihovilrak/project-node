import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as watcherModel from '../models/watcherModel';
import { isTaskProjectMember } from '../models/accessModel';
import logger from '../utils/logger';

// Get task watchers
export const getTaskWatchers = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { id } = req.params;
  try {
    const watchers = await watcherModel.getTaskWatchers(pool, id);
    res.status(200).json(watchers);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add task watcher
export const addTaskWatcher = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    if (userId === undefined || !/^\d+$/.test(String(userId))) {
      res.status(400).json({ error: 'A numeric userId is required' });
      return;
    }

    // A watcher receives the task's notifications, so they must be able to
    // reach the task in the first place.
    if (!(await isTaskProjectMember(pool, id, String(userId)))) {
      res.status(403).json({ error: 'User cannot access this task' });
      return;
    }

    const watcher = await watcherModel.addTaskWatcher(pool, id, String(userId));
    res.status(201).json(watcher);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove task watcher
export const removeTaskWatcher = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { id, userId } = req.params;
  try {
    const result = await watcherModel.removeTaskWatcher(pool, id, userId);
    if (result === 0) {
      res.status(404).json({ error: 'Watcher not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};
