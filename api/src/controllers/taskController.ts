import { Request, Response } from 'express';
import { Pool } from 'pg';
import { CustomRequest } from '../types/express';
import { TaskCreateInput, TaskUpdateInput, TaskQueryFilters } from '../types/task';
import * as taskModel from '../models/taskModel';
import * as notificationModel from '../models/notificationModel';
import { NotificationType } from '../types/notification';
import logger from '../utils/logger';

// Get tasks
export const getTasks = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
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
      active_statuses_only
    } = req.query;

    // Only use getTasksByProject when project_id is the sole filter
    const otherFilters = [
      id, assignee_id, holder_id, status_id, priority_id, type_id, parent_id,
      created_by, due_date_from, due_date_to, start_date_from, start_date_to,
      created_from, created_to, estimated_time_min, estimated_time_max, inactive_statuses_only, active_statuses_only
    ].some(Boolean);
    if (project_id && !otherFilters) {
      const tasks = await taskModel.getTasksByProject(pool, project_id as string);
      res.status(200).json(tasks);
      return;
    }

    const filters: TaskQueryFilters = {};

    if (id) {
      filters.id = Number(id);
    }
    if (project_id) {
      filters.project_id = Number(project_id);
    }
    if (assignee_id) {
      filters.assignee_id = Number(assignee_id);
    }
    if (holder_id) {
      filters.holder_id = Number(holder_id);
    }
    if (status_id) {
      filters.status_id = Number(status_id);
    }
    if (priority_id) {
      filters.priority_id = Number(priority_id);
    }
    if (type_id) {
      filters.type_id = Number(type_id);
    }
    if (parent_id) {
      filters.parent_id = Number(parent_id);
    }
    if (created_by) {
      filters.created_by = Number(created_by);
    }
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
    const tasks = await taskModel.getTasks(pool, hasFilters ? filters : undefined);
    res.status(200).json(tasks);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching tasks');
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get Task by ID
export const getTaskById = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> => {
  const { id } = req.params;
  try {
    const task = await taskModel.getTaskById(pool, id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.status(200).json(task);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching task by ID');
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get tasks by assignee
export const getTaskByAssignee = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const { assignee_id } = req.query;
    const result = await taskModel.getTasks(pool, { whereParams: { assignee_id: Number(assignee_id) } });
    if (!result || result.length === 0) {
      res.status(404).json({ message: 'No tasks assigned' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching tasks by assignee');
    res.status(500).json({ error: 'Internal server error'});
  }
}

// Get tasks by holder
export const getTaskByHolder = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const { holder_id } = req.query;
    const result = await taskModel.getTasks(pool, { whereParams: { holder_id: Number(holder_id) } });
    if (!result || result.length === 0) {
      res.status(404).json({ message: 'No tasks assigned' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching tasks by holder');
    res.status(500).json({ error: 'Internal server error'});
  }
}

// Create a task
export const createTask = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const taskData: TaskCreateInput = req.body;
    const created_by = taskData.created_by ?? req.session?.user?.id;
    const {
      holder_id,
      assignee_id,
      tag_ids,
      estimated_time
    } = taskData;

    // Create unique watchers array from holder, assignee, and creator
    const watcherIds = [holder_id, assignee_id, created_by];
    const watchers = Array.from(new Set(watcherIds))
      .filter((id): id is number => typeof id === 'number' && !isNaN(id));

    // Validate required fields
    const requiredFields: (keyof TaskCreateInput)[] = [
      'name',
      'start_date',
      'due_date',
      'priority_id',
      'status_id',
      'type_id',
      'project_id',
      'holder_id',
      'assignee_id'
    ];

    const missingFields = requiredFields.filter(field => !taskData[field]);

    if (missingFields.length > 0) {
      res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
      return;
    }

    const startDate = taskData.start_date ? new Date(taskData.start_date as string).getTime() : NaN;
    const dueDate = taskData.due_date ? new Date(taskData.due_date as string).getTime() : NaN;
    if (!isNaN(startDate) && !isNaN(dueDate) && dueDate < startDate) {
      res.status(400).json({ error: 'Due date must be on or after start date' });
      return;
    }
    const endDate = taskData.end_date ? new Date(taskData.end_date as string).getTime() : NaN;
    if (taskData.end_date != null && !isNaN(startDate) && !isNaN(endDate) && endDate < startDate) {
      res.status(400).json({ error: 'End date must be on or after start date' });
      return;
    }

    // Convert types to match database expectations
    const processedData: TaskCreateInput = {
      ...taskData,
      // Convert estimated_time from string to number if present
      estimated_time: estimated_time ? Number(estimated_time) : null,

      priority_id: taskData.priority_id,
      status_id: taskData.status_id,
      type_id: taskData.type_id,
      project_id: taskData.project_id,
      holder_id: taskData.holder_id,
      assignee_id: taskData.assignee_id,
      created_by: created_by ?? taskData.created_by,
      parent_id: taskData.parent_id || undefined,
      // Extract tag IDs and ensure they are numbers
      tag_ids: (taskData.tags || []).map(tag => Number(tag.id))
    };

    // Create task with processed data
    const task = await taskModel.createTask(pool, processedData, watchers);

    logger.debug({ task }, 'Created task');

    if (!task || !task.task_id) {
      throw new Error('Task creation failed - no task ID returned');
    }

    // Ensure we have valid numbers for the notification
    const taskId = Number(task.task_id);
    const actionUserId = Number(created_by);

    // Debug log
    logger.debug({ taskId, actionUserId, originalId: task.task_id, originalCreatedBy: created_by }, 'Converted IDs');

    if (isNaN(taskId)) {
      throw new Error(`Invalid task ID: ${task.task_id}`);
    }
    if (isNaN(actionUserId)) {
      throw new Error(`Invalid created_by ID: ${created_by}`);
    }

    // Create notifications for watchers
    await notificationModel.createWatcherNotifications(pool, {
      task_id: taskId,
      action_user_id: actionUserId,
      type_id: NotificationType.TaskCreated
    });

    res.status(201).json(task);
  } catch (error) {
    logger.error({ err: error, taskData: req.body }, 'Error creating task');
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
}

// Update a task
export const updateTask = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<void> => {
  const { id } = req.params;
  const userId = req.session.user?.id;
  const taskData: TaskUpdateInput = req.body;

  const startDate = taskData.start_date != null ? new Date(taskData.start_date as string).getTime() : null;
  const dueDate = taskData.due_date != null ? new Date(taskData.due_date as string).getTime() : null;
  const endDate = taskData.end_date != null ? new Date(taskData.end_date as string).getTime() : null;
  if (startDate != null && dueDate != null && !isNaN(startDate) && !isNaN(dueDate) && dueDate < startDate) {
    res.status(400).json({ error: 'Due date must be on or after start date' });
    return;
  }
  if (startDate != null && endDate != null && !isNaN(startDate) && !isNaN(endDate) && endDate < startDate) {
    res.status(400).json({ error: 'End date must be on or after start date' });
    return;
  }

  try {
    const task = await taskModel.updateTask(pool, id, taskData);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Create notifications for watchers
    await notificationModel.createWatcherNotifications(pool, {
      task_id: parseInt(id),
      action_user_id: parseInt(userId!),
      type_id: NotificationType.TaskUpdated  // Task Updated
    });

    res.status(200).json(task);
  } catch (error) {
    logger.error({ err: error }, 'Error updating task');
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Change task status
export const changeTaskStatus = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<void> => {
  const { id } = req.params;
  const { statusId } = req.body;
  const userId = req.session.user?.id;

  try {
    const task = await taskModel.changeTaskStatus(pool, Number(id), statusId);

    if (!task) {
      res.status(404).json({ error: 'Unable to update task status' });
      return;
    }

    // Create notifications for watchers
    await notificationModel.createWatcherNotifications(pool, {
      task_id: parseInt(id),
      action_user_id: parseInt(userId!),
      type_id: NotificationType.TaskUpdated  // Task Status Changed
    });

    res.status(200).json(task);
  } catch (error) {
    logger.error({ err: error }, 'Error changing task status');
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete a task
export const deleteTask = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> => {
  const { id } = req.params;
  try {
    const task = await taskModel.deleteTask(pool, id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.status(200).json(task);
  } catch (error) {
    logger.error({ err: error }, 'Error deleting task');
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get task statuses
export const getTaskStatuses = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const statuses = await taskModel.getTaskStatuses(pool);
    res.status(200).json(statuses);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching task statuses');
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get priorities
export const getPriorities = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const priorities = await taskModel.getPriorities(pool);
    res.status(200).json(priorities);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching priorities');
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get active tasks
export const getActiveTasks = async (
  req: CustomRequest,
  res: Response,
  pool: Pool
): Promise<void> => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const tasks = await taskModel.getActiveTasks(pool, userId);
    res.status(200).json(tasks);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching active tasks');
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get subtasks
export const getSubtasks = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<void> => {
  const { id } = req.params;
  try {
    const subtasks = await taskModel.getSubtasks(pool, id);
    res.status(200).json(subtasks);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching subtasks');
    res.status(500).json({ error: 'Internal server error' });
  }
}
