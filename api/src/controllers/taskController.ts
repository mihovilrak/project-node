import { Request, Response } from 'express';
import { Pool } from 'pg';
import { CustomRequest } from '../types/express';
import { CustomError } from '../types/error';
import {
  TaskCreateInput,
  TaskUpdateInput,
  TaskQueryFilters,
} from '../types/task';
import * as taskModel from '../models/taskModel';
import { resolveProjectScope } from '../models/accessModel';
import * as notificationModel from '../models/notificationModel';
import { NotificationType } from '../types/notification';
import logger from '../utils/logger';
import { parsePagination } from '../utils/pagination';
import { withTransaction } from '../utils/transaction';
import { parseIdParam, toTimestamp } from '../utils/requestParsing';
import { sessionUserId } from '../utils/sessionUser';

const DUE_BEFORE_START = 'Due date must be on or after start date';
const END_BEFORE_START = 'End date must be on or after start date';

/**
 * Retrieve tasks for the authenticated user with support for extensive filtering, scoping by project access, and pagination.
 *
 * Routes a lone project_id filter to a dedicated query path. Results are scoped to the projects the user can access unless the user is an administrator.
 * @param req Express request with optional filter and pagination query parameters
 * @param res Express response object
 * @param pool Database connection pool
 */
export const getTasks = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const userId = sessionUserId(req as CustomRequest);

  const {
    id,
    project_id,
    assignee_id,
    holder_id,
    status_id,
    priority_id,
    type_id,
    parent_id,
    created_by,
    due_date_from,
    due_date_to,
    start_date_from,
    start_date_to,
    created_from,
    created_to,
    estimated_time_min,
    estimated_time_max,
    inactive_statuses_only,
    active_statuses_only,
  } = req.query;

  const otherFilters = [
    id,
    assignee_id,
    holder_id,
    status_id,
    priority_id,
    type_id,
    parent_id,
    created_by,
    due_date_from,
    due_date_to,
    start_date_from,
    start_date_to,
    created_from,
    created_to,
    estimated_time_min,
    estimated_time_max,
    inactive_statuses_only,
    active_statuses_only,
  ].some(Boolean);
  const pagination = parsePagination(req.query);
  // Scoped inside the query rather than filtered afterwards, otherwise paging drops rows.
  const scopeUserId = await resolveProjectScope(pool, userId);

  if (project_id && !otherFilters) {
    const tasks = await taskModel.getTasksByProject(
      pool,
      project_id as string,
      pagination,
      scopeUserId,
    );
    res.status(200).json(tasks);
    return;
  }

  const filters: TaskQueryFilters = {};

  const parsedId = id !== undefined && id !== '' ? Number(id) : NaN;
  if (!Number.isNaN(parsedId)) filters.id = parsedId;
  const parsedProjectId = parseIdParam(
    project_id as string | string[] | undefined,
  );
  if (parsedProjectId !== null) filters.project_id = parsedProjectId;
  const parsedAssigneeId = parseIdParam(
    assignee_id as string | string[] | undefined,
  );
  if (parsedAssigneeId !== null) filters.assignee_id = parsedAssigneeId;
  const parsedHolderId = parseIdParam(
    holder_id as string | string[] | undefined,
  );
  if (parsedHolderId !== null) filters.holder_id = parsedHolderId;
  const parsedStatusId = parseIdParam(
    status_id as string | string[] | undefined,
  );
  if (parsedStatusId !== null) filters.status_id = parsedStatusId;
  const parsedPriorityId = parseIdParam(
    priority_id as string | string[] | undefined,
  );
  if (parsedPriorityId !== null) filters.priority_id = parsedPriorityId;
  const parsedTypeId = parseIdParam(type_id as string | string[] | undefined);
  if (parsedTypeId !== null) filters.type_id = parsedTypeId;
  const parsedParentId =
    parent_id !== undefined && parent_id !== '' ? Number(parent_id) : NaN;
  if (!Number.isNaN(parsedParentId)) filters.parent_id = parsedParentId;
  const parsedCreatedBy = parseIdParam(
    created_by as string | string[] | undefined,
  );
  if (parsedCreatedBy !== null) filters.created_by = parsedCreatedBy;
  if (due_date_from && typeof due_date_from === 'string') {
    filters.due_date_from = due_date_from;
  }
  if (due_date_to && typeof due_date_to === 'string') {
    filters.due_date_to = due_date_to;
  }
  if (start_date_from && typeof start_date_from === 'string') {
    filters.start_date_from = start_date_from;
  }
  if (start_date_to && typeof start_date_to === 'string') {
    filters.start_date_to = start_date_to;
  }
  if (created_from && typeof created_from === 'string') {
    filters.created_from = created_from;
  }
  if (created_to && typeof created_to === 'string') {
    filters.created_to = created_to;
  }
  if (estimated_time_min !== undefined) {
    filters.estimated_time_min = Number(estimated_time_min);
  }
  if (estimated_time_max !== undefined) {
    filters.estimated_time_max = Number(estimated_time_max);
  }
  if (inactive_statuses_only === '1' || inactive_statuses_only === 'true') {
    filters.inactive_statuses_only = true;
  }
  if (active_statuses_only === '1' || active_statuses_only === 'true') {
    filters.active_statuses_only = true;
  }

  const hasFilters = Object.keys(filters).length > 0;
  const tasks = await taskModel.getTasks(
    pool,
    hasFilters ? filters : undefined,
    pagination,
    scopeUserId,
  );
  res.status(200).json(tasks);
};

/** Parse an ISO date/datetime query param into a `YYYY-MM-DD` string, or null. */
const parseDateParam = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
};

/**
 * Retrieve tasks overlapping a date range for the calendar view, scoped to the user's projects and paginated.
 * @param req Express request with start_date, end_date, limit and offset query parameters
 * @param res Express response object
 * @param pool Database connection pool
 */
export const getTasksByDateRange = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const userId = sessionUserId(req as CustomRequest);

  const startDate = parseDateParam(req.query.start_date);
  const endDate = parseDateParam(req.query.end_date);
  if (!startDate || !endDate) {
    res
      .status(400)
      .json({ error: 'start_date and end_date must be valid dates' });
    return;
  }
  if (endDate < startDate) {
    res.status(400).json({ error: 'end_date must be on or after start_date' });
    return;
  }

  const scopeUserId = await resolveProjectScope(pool, userId);
  const tasks = await taskModel.getTasksByDateRange(
    pool,
    startDate,
    endDate,
    scopeUserId,
    parsePagination(req.query),
  );
  res.status(200).json(tasks);
};

/**
 * Retrieve a single task by its identifier.
 * @param req Express request object containing the task id in params
 * @param res Express response object
 * @param pool Database connection pool
 */
export const getTaskById = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const task = await taskModel.getTaskById(pool, req.params.id as string);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.status(200).json(task);
};

/**
 * Create a new task and notify its watchers in one transaction.
 *
 * Authorship comes from the session. Holder, assignee and creator become watchers. create_task() rejects holders, assignees, watchers and parents outside the project with 22023, which the error handler maps to 400.
 * @param req Request with the task creation payload in body
 * @param res Response object
 * @param pool Database connection pool
 */
export const createTask = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const taskData: TaskCreateInput = req.body ?? {};
  // A client-supplied created_by would let a caller attribute the task to somebody else.
  const created_by = Number(sessionUserId(req));
  const { holder_id, assignee_id, estimated_time } = taskData;

  const watchers = Array.from(
    new Set([holder_id, assignee_id, created_by]),
  ).filter((id): id is number => typeof id === 'number' && !isNaN(id));

  const requiredFields: (keyof TaskCreateInput)[] = [
    'name',
    'start_date',
    'due_date',
    'priority_id',
    'status_id',
    'type_id',
    'project_id',
    'holder_id',
    'assignee_id',
  ];

  // A falsy check would reject a legitimate 0.
  const missingFields = requiredFields.filter((field) => {
    const value = taskData[field];
    return (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    );
  });

  if (missingFields.length > 0) {
    res.status(400).json({
      error: 'Missing required fields',
      missingFields,
    });
    return;
  }

  const startDate = toTimestamp(taskData.start_date as Date | string);
  const dueDate = toTimestamp(taskData.due_date as Date | string);
  if (!isNaN(startDate) && !isNaN(dueDate) && dueDate < startDate) {
    res.status(400).json({ error: DUE_BEFORE_START });
    return;
  }
  const endDate = taskData.end_date
    ? toTimestamp(taskData.end_date as Date | string)
    : NaN;
  if (!isNaN(startDate) && !isNaN(endDate) && endDate < startDate) {
    res.status(400).json({ error: END_BEFORE_START });
    return;
  }

  const processedData: TaskCreateInput = {
    ...taskData,
    estimated_time: estimated_time ? Number(estimated_time) : null,
    created_by,
    parent_id: taskData.parent_id || undefined,
    tag_ids: (taskData.tags || []).map((tag) => Number(tag.id)),
  };

  const task = await withTransaction(pool, async (client) => {
    const created = await taskModel.createTask(client, processedData, watchers);

    const taskId = Number(created?.task_id);
    if (!Number.isInteger(taskId)) {
      throw new Error('Task creation failed - no task ID returned');
    }

    await notificationModel.createWatcherNotifications(client, {
      task_id: taskId,
      action_user_id: created_by,
      type_id: NotificationType.TaskCreated,
    });

    return created;
  });

  logger.debug({ taskId: task.task_id }, 'Created task');
  res.status(201).json(task);
};

const optionalTimestamp = (value: unknown): number | null =>
  value != null ? toTimestamp(value as Date | string) : null;

/**
 * Update task properties and notify watchers.
 *
 * Rejects a due or end date before the start date, and a holder or assignee who is not a member of the task's project.
 * @param req Request with task id in params and TaskUpdateInput in body
 * @param res Response object
 * @param pool Database connection pool
 */
export const updateTask = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const id = req.params.id as string;
  const userId = Number(sessionUserId(req));
  const taskData: TaskUpdateInput = req.body ?? {};

  const startDate = optionalTimestamp(taskData.start_date);
  const dueDate = optionalTimestamp(taskData.due_date);
  const endDate = optionalTimestamp(taskData.end_date);
  if (startDate != null && dueDate != null && dueDate < startDate) {
    res.status(400).json({ error: DUE_BEFORE_START });
    return;
  }
  if (startDate != null && endDate != null && endDate < startDate) {
    res.status(400).json({ error: END_BEFORE_START });
    return;
  }

  const people = [taskData.holder_id, taskData.assignee_id]
    .filter((value) => value !== undefined && value !== null)
    .map(Number);
  if (people.some((value) => !Number.isInteger(value) || value < 1)) {
    res.status(400).json({ error: 'Invalid holder or assignee' });
    return;
  }
  if (people.length > 0) {
    const members = await taskModel.areTaskProjectMembers(pool, id, people);
    if (members === null) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    if (!members) {
      res
        .status(400)
        .json({ error: 'Holder and assignee must be project members' });
      return;
    }
  }

  const task = await withTransaction(pool, async (client) => {
    const updated = await taskModel.updateTask(client, id, taskData);
    if (!updated) {
      return null;
    }

    await notificationModel.createWatcherNotifications(client, {
      task_id: Number(id),
      action_user_id: userId,
      type_id: NotificationType.TaskUpdated,
    });

    return updated;
  });

  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.status(200).json(task);
};

/**
 * Update a task's status and notify watchers.
 * @param req Request with task id in params and statusId in body
 * @param res Response object
 * @param pool Database connection pool
 */
export const changeTaskStatus = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const id = req.params.id as string;
  const userId = Number(sessionUserId(req));
  const statusIdNum = Number(req.body?.statusId);
  if (!Number.isInteger(statusIdNum) || statusIdNum < 1) {
    res.status(400).json({ error: 'statusId must be a positive integer' });
    return;
  }

  const task = await withTransaction(pool, async (client) => {
    const updated = await taskModel.changeTaskStatus(
      client,
      Number(id),
      statusIdNum,
    );
    if (!updated) {
      return null;
    }

    await notificationModel.createWatcherNotifications(client, {
      task_id: Number(id),
      action_user_id: userId,
      type_id: NotificationType.TaskUpdated,
    });

    return updated;
  });

  if (!task) {
    res.status(404).json({ error: 'Unable to update task status' });
    return;
  }

  res.status(200).json(task);
};

/**
 * Update a task's start and/or due date for Gantt rescheduling and notify watchers.
 *
 * The date order is enforced by the tasks check constraint, so a partial update is validated against the stored value of the date it does not change.
 * @param req Request with task id in params and start_date and/or due_date in body
 * @param res Response object
 * @param pool Database connection pool
 */
export const updateTaskDates = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const id = req.params.id as string;
  const userId = Number(sessionUserId(req));
  const { start_date, due_date } = req.body ?? {};

  if (start_date === undefined && due_date === undefined) {
    res
      .status(400)
      .json({ error: 'At least one of start_date or due_date is required' });
    return;
  }

  const dates: TaskUpdateInput = {};
  for (const [key, value] of Object.entries({ start_date, due_date })) {
    if (value === undefined) continue;
    const timestamp = toTimestamp(value as Date | string);
    if (isNaN(timestamp)) {
      res.status(400).json({ error: `${key} must be a valid date` });
      return;
    }
    (dates as Record<string, Date>)[key] = new Date(timestamp);
  }

  let task;
  try {
    task = await withTransaction(pool, async (client) => {
      const updated = await taskModel.updateTask(client, id, dates);
      if (!updated) {
        return null;
      }

      await notificationModel.createWatcherNotifications(client, {
        task_id: Number(id),
        action_user_id: userId,
        type_id: NotificationType.TaskUpdated,
      });

      return updated;
    });
  } catch (error) {
    // 23514 = check_violation from the due_date >= start_date constraint.
    if ((error as CustomError)?.code === '23514') {
      res.status(400).json({ error: DUE_BEFORE_START });
      return;
    }
    throw error;
  }

  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.status(200).json(task);
};

/**
 * Soft-delete a task and return its final state.
 * @param req Request object with task id in params
 * @param res Response object
 * @param pool Database connection pool
 */
export const deleteTask = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const task = await taskModel.deleteTask(pool, req.params.id as string);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.status(200).json(task);
};

export const getTaskStatuses = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  res.status(200).json(await taskModel.getTaskStatuses(pool));
};

export const getPriorities = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  res.status(200).json(await taskModel.getPriorities(pool));
};

/**
 * Retrieve active tasks assigned to the authenticated user.
 * @param req Express request with an authenticated session
 * @param res Express response object
 * @param pool Database connection pool
 */
export const getActiveTasks = async (
  req: CustomRequest,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const tasks = await taskModel.getActiveTasks(pool, sessionUserId(req));
  res.status(200).json(tasks);
};

/**
 * Retrieve the subtasks of a parent task.
 * @param req HTTP request containing the parent task id in params
 * @param res HTTP response
 * @param pool Database connection pool
 */
export const getSubtasks = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<void> => {
  const subtasks = await taskModel.getSubtasks(pool, req.params.id as string);
  res.status(200).json(subtasks);
};
