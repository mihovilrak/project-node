import { Request, Response } from 'express';
import { Pool } from 'pg';
import { isActiveUser, isTaskProjectMember } from '../models/accessModel';
import { hasPermission } from '../models/permissionModel';
import * as timeLogModel from '../models/timeLogModel';
import { CustomRequest } from '../types/express';
import {
  TimeLogCreateInput,
  TimeLogQueryFilters,
  TimeLogUpdateInput,
} from '../types/timeLog';
import { parsePagination } from '../utils/pagination';
import { sessionUserId } from '../utils/sessionUser';

const MAX_HOURS_PER_LOG = 24;

const isValidSpentTime = (value: unknown): boolean => {
  const hours = Number(value);
  return (
    value !== '' &&
    value !== null &&
    Number.isFinite(hours) &&
    hours > 0 &&
    hours <= MAX_HOURS_PER_LOG
  );
};

const SPENT_TIME_ERROR = `spent_time must be greater than 0 and at most ${MAX_HOURS_PER_LOG} hours`;

type LogUserResolution =
  { userId: string } | { status: 400 | 403; error: string };

/**
 * Resolve whose time log this is. Logging for someone else needs Admin, and the
 * target must be an active member of the task's project. Logging one's own time
 * on create is left to the route's project-access check; reassigning an
 * existing log (`reassigning`) applies the member check to the caller too.
 */
const resolveLogUser = async (
  pool: Pool,
  sessionUser: string,
  requested: unknown,
  taskId: string,
  reassigning = false,
): Promise<LogUserResolution> => {
  if (requested === undefined) return { userId: sessionUser };
  const target =
    typeof requested === 'number' ||
    (typeof requested === 'string' && requested.trim() !== '')
      ? Number(requested)
      : NaN;
  if (!Number.isInteger(target) || target <= 0) {
    return { status: 400, error: 'user_id must be a positive integer' };
  }
  const targetId = String(target);
  if (targetId === sessionUser && !reassigning) return { userId: sessionUser };

  if (
    targetId !== sessionUser &&
    !(await hasPermission(pool, sessionUser, 'Admin'))
  ) {
    return {
      status: 403,
      error: 'Only admins can log time for another user',
    };
  }
  if (!(await isActiveUser(pool, targetId))) {
    return { status: 400, error: 'user_id must refer to an active user' };
  }
  if (!(await isTaskProjectMember(pool, taskId, targetId))) {
    return {
      status: 400,
      error: "user_id must refer to a member of the task's project",
    };
  }
  return { userId: targetId };
};

export const getAllTimeLogs = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const timeLogs = await timeLogModel.getAllTimeLogs(
    pool,
    parsePagination(req.query),
  );
  res.status(200).json(timeLogs);
};

export const getTaskTimeLogs = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const timeLogs = await timeLogModel.getTaskTimeLogs(
    pool,
    req.params.taskId as string,
    req.query as TimeLogQueryFilters,
    parsePagination(req.query),
  );
  res.status(200).json(timeLogs);
};

export const getTaskSpentTime = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const spentTime = await timeLogModel.getTaskSpentTime(
    pool,
    req.params.taskId as string,
  );
  res.status(200).json(spentTime);
};

export const getProjectTimeLogs = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const timeLogs = await timeLogModel.getProjectTimeLogs(
    pool,
    req.params.projectId as string,
    req.query as TimeLogQueryFilters,
    parsePagination(req.query),
  );
  res.status(200).json(timeLogs);
};

export const getProjectSpentTime = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const spentTime = await timeLogModel.getProjectSpentTime(
    pool,
    req.params.projectId as string,
  );
  res.status(200).json(spentTime);
};

export const createTimeLog = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const sessionUser = sessionUserId(req);
  const taskId = req.params.taskId as string;
  const { log_date, spent_time, description, activity_type_id, user_id } =
    (req.body ?? {}) as TimeLogCreateInput;

  if (spent_time == null || !activity_type_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!isValidSpentTime(spent_time)) {
    return res.status(400).json({ error: SPENT_TIME_ERROR });
  }

  const owner = await resolveLogUser(pool, sessionUser, user_id, taskId);
  if ('error' in owner) {
    return res.status(owner.status).json({ error: owner.error });
  }

  const timeLog = await timeLogModel.createTimeLog(pool, taskId, owner.userId, {
    log_date,
    spent_time,
    description: description ?? '',
    activity_type_id,
  });
  res.status(201).json(timeLog);
};

export const updateTimeLog = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const body = (req.body ?? {}) as TimeLogUpdateInput;
  const timeLogId = req.params.timeLogId as string;

  // Forward only the keys actually sent so a partial update leaves the rest
  // of the row intact.
  const updates: TimeLogUpdateInput = {};
  for (const key of [
    'log_date',
    'spent_time',
    'description',
    'activity_type_id',
  ] as const) {
    if (body[key] !== undefined) {
      (updates as Record<string, unknown>)[key] = body[key];
    }
  }
  if (
    updates.spent_time !== undefined &&
    !isValidSpentTime(updates.spent_time)
  ) {
    return res.status(400).json({ error: SPENT_TIME_ERROR });
  }

  if (body.user_id !== undefined) {
    const current = await timeLogModel.getTimeLogRef(pool, timeLogId);
    if (!current) {
      return res.status(404).json({ error: 'Time log not found' });
    }
    // Resending the current owner is a no-op, so edits of logs whose owner has
    // since left the project still go through.
    if (String(body.user_id) !== current.userId) {
      const owner = await resolveLogUser(
        pool,
        sessionUserId(req),
        body.user_id,
        current.taskId,
        true,
      );
      if ('error' in owner) {
        return res.status(owner.status).json({ error: owner.error });
      }
      updates.user_id = owner.userId;
    }
  }

  const timeLog = await timeLogModel.updateTimeLog(pool, timeLogId, updates);
  if (!timeLog) {
    return res.status(404).json({ error: 'Time log not found' });
  }
  res.status(200).json(timeLog);
};

export const deleteTimeLog = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const deleted = await timeLogModel.deleteTimeLog(
    pool,
    req.params.timeLogId as string,
  );
  if (!deleted) {
    return res.status(404).json({ error: 'Time log not found' });
  }
  res.status(200).json({ message: 'Time log deleted successfully' });
};

export const getUserTimeLogs = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const timeLogs = await timeLogModel.getUserTimeLogs(
    pool,
    sessionUserId(req),
    req.query as TimeLogQueryFilters,
    parsePagination(req.query),
  );
  res.status(200).json(timeLogs);
};
