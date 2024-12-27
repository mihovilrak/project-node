import { Request, Response } from 'express';
import { DatabasePool } from '../types/models';
import { CustomRequest } from '../types/express';
import { TaskCreateInput, TaskUpdateInput } from '../types/task';
import * as taskModel from '../models/taskModel';
import * as notificationModel from '../models/notificationModel';

// Get tasks
export async function getTasks(
  req: Request,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  const { project_id } = req.query;
  try {
    const tasks = project_id
      ? await taskModel.getTasksByProject(pool, project_id as string)
      : await taskModel.getTasks(pool);
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get Task by ID
export async function getTaskById(
  req: Request,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  const { id } = req.params;
  try {
    const task = await taskModel.getTaskById(pool, id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get tasks by assignee
export async function getTaskByAssignee(
  req: Request,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  try {
    const { assignee_id } = req.query;
    const result = await taskModel.getTasks(pool, { assignee_id: assignee_id as string });
    if (!result) {
      res.status(404).json({ message: 'No tasks assigned' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error'});
  }
}

// Get tasks by holder
export async function getTaskByHolder(
  req: Request,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  try {
    const { holder_id } = req.query;
    const result = await taskModel.getTasks(pool, { holder_id: holder_id as string });
    if (!result) {
      res.status(404).json({ message: 'No tasks assigned' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error'});
  }
}

// Create a task
export async function createTask(
  req: CustomRequest,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  try {
    const taskData: TaskCreateInput = req.body;
    const {
      holder_id,
      assignee_id,
      created_by
    } = taskData;

    // Create unique watchers array from holder, assignee, and creator
    const watchers = [...new Set([holder_id, assignee_id, created_by])].filter(id => id);

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

    const result = await taskModel.createTask(pool, taskData, watchers);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
}

// Update a task
export async function updateTask(
  req: CustomRequest,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  const { id } = req.params;
  const userId = req.session.user?.id;
  const taskData: TaskUpdateInput = req.body;

  try {
    const task = await taskModel.updateTask(pool, id, taskData);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Create notifications for watchers
    await notificationModel.createWatcherNotifications(pool, {
      task_id: id,
      action_user_id: userId!,
      type_id: 'task_updated'
    });

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Change task status
export async function changeTaskStatus(
  req: CustomRequest,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  const { id } = req.params;
  const { statusId } = req.body;
  const userId = req.session.user?.id;

  try {
    const task = await taskModel.changeTaskStatus(pool, id, statusId);
    
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Create notifications for watchers
    await notificationModel.createWatcherNotifications(pool, {
      task_id: id,
      action_user_id: userId!,
      type_id: 'task_status_changed'
    });

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete a task
export async function deleteTask(
  req: Request,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  const { id } = req.params;
  try {
    const task = await taskModel.deleteTask(pool, id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get task statuses
export async function getTaskStatuses(
  req: Request,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  try {
    const statuses = await taskModel.getTaskStatuses(pool);
    res.status(200).json(statuses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get priorities
export async function getPriorities(
  req: Request,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  try {
    const priorities = await taskModel.getPriorities(pool);
    res.status(200).json(priorities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get active tasks
export async function getActiveTasks(
  req: CustomRequest,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const tasks = await taskModel.getActiveTasks(pool, userId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get subtasks
export async function getSubtasks(
  req: Request,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  const { id } = req.params;
  try {
    const subtasks = await taskModel.getSubtasks(pool, id);
    res.status(200).json(subtasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get task watchers
export async function getTaskWatchers(
  req: Request,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  const { id } = req.params;
  try {
    const watchers = await taskModel.getTaskWatchers(pool, id);
    res.status(200).json(watchers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Add task watcher
export async function addTaskWatcher(
  req: Request,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const watcher = await taskModel.addTaskWatcher(pool, id, userId);
    res.status(201).json(watcher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Remove task watcher
export async function removeTaskWatcher(
  req: Request,
  res: Response,
  pool: DatabasePool
): Promise<void> {
  const { id, userId } = req.params;
  try {
    const result = await taskModel.removeTaskWatcher(pool, id, userId);
    if (result === 0) {
      res.status(404).json({ error: 'Watcher not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
