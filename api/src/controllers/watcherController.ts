import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as watcherModel from '../models/watcherModel';
import { isTaskProjectMember } from '../models/accessModel';
import logger from '../utils/logger';
import { parsePositiveInteger } from '../utils/requestParsing';

/**
 * Retrieve all watchers assigned to a task.
 *
 * Extracts the task ID from request parameters, queries the watcher model for associated watchers, and responds with a 200 status and watcher list on success. Returns a 500 error response if an internal error occurs during retrieval.
 * @param req Express request object containing the task ID in params.
 * @param res Express response object for sending watcher data or error responses.
 * @param pool Database connection pool for executing watcher queries.
 */
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

/**
 * Add a user as a watcher to a task, allowing them to receive its notifications.
 *
 * The user must be a member of the task's project to become a watcher. A numeric userId is required in the request body and the task id in the URL parameters.
 * @param req Express request containing the task id in params and userId in the request body
 * @param res Express response to send the created watcher record with 201 status, or an error response
 * @param pool Database connection pool for queries
 */
export const addTaskWatcher = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const parsedUserId = parsePositiveInteger(userId);
    if (parsedUserId === null) {
      res.status(400).json({ error: 'A numeric userId is required' });
      return;
    }

    // A watcher receives the task's notifications, so they must be able to
    // reach the task in the first place.
    if (!(await isTaskProjectMember(pool, id, String(parsedUserId)))) {
      res.status(403).json({ error: 'User cannot access this task' });
      return;
    }

    const watcher = await watcherModel.addTaskWatcher(pool, id, parsedUserId);
    res.status(201).json(watcher);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Remove a user's watcher subscription from a task.
 *
 * Accepts task id and userId from request parameters. Returns 204 on successful deletion, 400 if userId is not a positive integer, 404 if the watcher entry does not exist, or 500 on server error.
 * @param req Express request object containing task id and numeric userId in params
 * @param res Express response object for sending status and JSON replies
 * @param pool Database connection pool for executing the delete operation
 */
export const removeTaskWatcher = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const { id, userId } = req.params;
  try {
    const parsedUserId = parsePositiveInteger(userId);
    if (parsedUserId === null) {
      res.status(400).json({ error: 'A numeric userId is required' });
      return;
    }

    const result = await watcherModel.removeTaskWatcher(pool, id, parsedUserId);
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
