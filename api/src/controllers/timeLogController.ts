import { Request, Response } from 'express';
import { Pool } from 'pg';
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
  const userId = sessionUserId(req);
  const { log_date, spent_time, description, activity_type_id } = (req.body ??
    {}) as TimeLogCreateInput;

  if (spent_time == null || !activity_type_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!isValidSpentTime(spent_time)) {
    return res.status(400).json({ error: SPENT_TIME_ERROR });
  }

  const timeLog = await timeLogModel.createTimeLog(
    pool,
    req.params.taskId as string,
    userId,
    {
      log_date,
      spent_time,
      description: description ?? '',
      activity_type_id,
    },
  );
  res.status(201).json(timeLog);
};

export const updateTimeLog = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const body = (req.body ?? {}) as TimeLogUpdateInput;

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

  const timeLog = await timeLogModel.updateTimeLog(
    pool,
    req.params.timeLogId as string,
    updates,
  );
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
