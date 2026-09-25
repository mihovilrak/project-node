import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as watcherModel from '../models/watcherModel';
import { isTaskProjectMember } from '../models/accessModel';
import { hasPermission } from '../models/permissionModel';
import { CustomRequest } from '../types/express';
import { parsePositiveInteger } from '../utils/requestParsing';
import { sessionUserId } from '../utils/sessionUser';

// Anyone with task access may (un)watch a task themselves; changing somebody
// else's subscription needs 'Edit tasks'.
const mayManageWatcher = async (
  pool: Pool,
  req: Request,
  watcherId: number,
): Promise<boolean> => {
  const actorId = sessionUserId(req as CustomRequest);
  return (
    Number(actorId) === watcherId ||
    (await hasPermission(pool, actorId, 'Edit tasks'))
  );
};

/**
 * Retrieve all watchers of a task.
 *
 * @param req Express request object containing the task ID in params.
 * @param res Express response object.
 * @param pool Database connection pool.
 */
export const getTaskWatchers = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const watchers = await watcherModel.getTaskWatchers(
    pool,
    req.params.id as string,
  );
  res.status(200).json(watchers);
};

/**
 * Add a user as a watcher of a task.
 *
 * The watcher must be a member of the task's project. Adding someone other than
 * yourself requires 'Edit tasks'.
 *
 * @param req Express request with the task id in params and userId in the body
 * @param res Express response
 * @param pool Database connection pool
 */
export const addTaskWatcher = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const id = req.params.id as string;
  const parsedUserId = parsePositiveInteger(req.body?.userId);
  if (parsedUserId === null) {
    res.status(400).json({ error: 'A numeric userId is required' });
    return;
  }

  if (!(await mayManageWatcher(pool, req, parsedUserId))) {
    res.status(403).json({ error: 'Permission denied: Edit tasks required' });
    return;
  }

  if (!(await isTaskProjectMember(pool, id, String(parsedUserId)))) {
    res.status(403).json({ error: 'User cannot access this task' });
    return;
  }

  const watcher = await watcherModel.addTaskWatcher(pool, id, parsedUserId);
  res.status(201).json(watcher);
};

/**
 * Remove a watcher from a task. Removing someone other than yourself requires
 * 'Edit tasks'.
 *
 * @param req Express request with task id and userId in params
 * @param res Express response
 * @param pool Database connection pool
 */
export const removeTaskWatcher = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const parsedUserId = parsePositiveInteger(req.params.userId);
  if (parsedUserId === null) {
    res.status(400).json({ error: 'A numeric userId is required' });
    return;
  }

  if (!(await mayManageWatcher(pool, req, parsedUserId))) {
    res.status(403).json({ error: 'Permission denied: Edit tasks required' });
    return;
  }

  const result = await watcherModel.removeTaskWatcher(
    pool,
    req.params.id as string,
    parsedUserId,
  );
  if (result === 0) {
    res.status(404).json({ error: 'Watcher not found' });
    return;
  }
  res.status(204).send();
};
