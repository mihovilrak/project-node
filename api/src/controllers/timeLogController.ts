import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as timeLogModel from '../models/timeLogModel';
import { CustomRequest } from '../types/express';
import {
  TimeLogCreateInput,
  TimeLogQueryFilters,
  TimeLogUpdateInput,
} from '../types/timeLog';
import logger from '../utils/logger';
import { parsePagination } from '../utils/pagination';

/**
 * Retrieve all time logs with optional pagination support.
 * @param req Express request object containing optional pagination query parameters
 * @param res Express response object for sending the paginated time logs or error
 * @param pool Database connection pool for executing queries
 */
export const getAllTimeLogs = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const timeLogs = await timeLogModel.getAllTimeLogs(
      pool,
      parsePagination(req.query),
    );
    res.status(200).json(timeLogs);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve all time logs recorded against a specific task, optionally filtered by date range or activity type.
 * @param req Express request object containing taskId in route parameters and optional TimeLogQueryFilters in query string
 * @param res Express response object for sending HTTP responses
 * @param pool Database connection pool for executing queries
 */
export const getTaskTimeLogs = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { taskId } = req.params;
    const timeLogs = await timeLogModel.getTaskTimeLogs(
      pool,
      taskId,
      req.query as TimeLogQueryFilters,
    );
    res.status(200).json(timeLogs);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get task spent time
export const getTaskSpentTime = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { taskId } = req.params;
    const spentTime = await timeLogModel.getTaskSpentTime(pool, taskId);
    res.status(200).json(spentTime);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve all time logs associated with a specific project.
 * @param req HTTP request containing the project ID in params and optional query filters
 * @param res HTTP response object for sending the time logs or error
 * @param pool Database connection pool for executing queries
 */
export const getProjectTimeLogs = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { projectId } = req.params;
    const params = req.query;
    const timeLogs = await timeLogModel.getProjectTimeLogs(
      pool,
      projectId,
      params,
    );
    res.status(200).json(timeLogs);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve and return the total time spent on all tasks within a project.
 * @param req Request object containing projectId in params
 * @param res Response object for sending JSON result
 * @param pool Database connection pool
 */
export const getProjectSpentTime = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { projectId } = req.params;
    const spentTime = await timeLogModel.getProjectSpentTime(pool, projectId);
    res.status(200).json(spentTime);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Record time spent on a task for the authenticated user.
 *
 * Requires user authentication via session. Expects taskId in URL parameters and spent_time and activity_type_id as mandatory fields in the request body. Accepts optional log_date and description.
 * @param req CustomRequest with session user context and task ID in params, time log details in body
 * @param res Response object for sending status and JSON payload
 * @param pool Database connection pool
 */
export const createTimeLog = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { taskId } = req.params;
    const userId = req.session?.user?.id;
    const { log_date, spent_time, description, activity_type_id } =
      req.body as TimeLogCreateInput;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (spent_time == null || !activity_type_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const timeLog = await timeLogModel.createTimeLog(pool, taskId, userId, {
      log_date,
      spent_time,
      description: description ?? '',
      activity_type_id,
    });
    res.status(201).json(timeLog);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Modify an existing time log with partial updates and return the updated record or 404 if not found.
 *
 * Accepts only the fields log_date, spent_time, description, and activity_type_id; undefined fields are omitted to preserve existing values. Returns 404 if the time log does not exist, 200 with the updated record on success, or 500 on server error.
 * @param req Express request containing timeLogId in params and update fields in body
 * @param res Express response for sending the result or error
 * @param pool Database connection pool
 */
export const updateTimeLog = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { timeLogId } = req.params;
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

    const timeLog = await timeLogModel.updateTimeLog(pool, timeLogId, updates);
    if (!timeLog) {
      return res.status(404).json({ error: 'Time log not found' });
    }
    res.status(200).json(timeLog);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Remove a time log record by its identifier.
 * @param req HTTP request containing the timeLogId parameter
 * @param res HTTP response object
 * @param pool Database connection pool
 */
export const deleteTimeLog = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const { timeLogId } = req.params;
    await timeLogModel.deleteTimeLog(pool, timeLogId);
    res.status(200).json({ message: 'Time log deleted successfully' });
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieve all time log entries for the authenticated user with optional filtering.
 *
 * Requires user authentication via session. Accepts query parameters for filtering by date range and activity type. Returns 401 if user is not authenticated, 200 on success with time log data, or 500 on server error.
 * @param req CustomRequest with session containing authenticated user id and query parameters for filtering
 * @param res Response object for sending the time logs or error status
 * @param pool Database connection pool for executing queries
 */
export const getUserTimeLogs = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const userId = req.session?.user?.id;
    const params = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const timeLogs = await timeLogModel.getUserTimeLogs(pool, userId, params);
    res.status(200).json(timeLogs);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};
