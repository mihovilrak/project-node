import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as commentModel from '../models/commentModel';
import * as notificationModel from '../models/notificationModel';
import { CustomRequest } from '../types/express';
import {
  CommentCreateInput,
  CommentUpdateInput,
  TaskRequest,
} from '../types/comment';
import { NotificationType } from '../types/notification';
import logger from '../utils/logger';

// Get task comments
export const getTaskComments = async (
  req: TaskRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const taskId = req.taskId;
    const comments = await commentModel.getTaskComments(pool, taskId || '');
    res.status(200).json(comments);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Add a new comment to a task and notify watchers.
 *
 * Requires an authenticated user session. Extracts the task ID from the request and comment text from the body, then creates the comment and generates notifications for all users watching the task.
 * @param req Combined request object containing user session, task ID, and comment body
 * @param res Response object for sending the created comment or error status
 * @param pool Database connection pool
 */
export const createComment = async (
  req: CustomRequest & TaskRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  try {
    const taskId = req.taskId;
    const { comment } = req.body as CommentCreateInput;
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const newComment = await commentModel.createComment(
      pool,
      taskId || '',
      userId,
      comment,
    );

    // Create notifications for watchers
    await notificationModel.createWatcherNotifications(pool, {
      action_user_id: parseInt(userId),
      type_id: NotificationType.TaskComment, // Task Comment
      task_id: parseInt(taskId!),
    });

    res.status(201).json(newComment);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update a comment's text and return the modified comment or a 404 error if not found.
 *
 * Extracts the comment ID from request parameters and updated text from the request body, then delegates to the comment model for persistence. Returns the updated comment with user details on success, or a 404 response if the comment does not exist. Catches and logs errors, responding with a 500 status for unexpected failures.
 * @param req Express request containing the comment ID in params and updated comment text in the body
 * @param res Express response object for sending the result or error status
 * @param pool Database connection pool for executing queries
 */
export const editComment = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const { id } = req.params;
  const { comment } = req.body as CommentUpdateInput;

  try {
    const editedComment = await commentModel.editComment(pool, id, comment);
    if (!editedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json(editedComment);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Remove a comment by marking it inactive and returning its data.
 * @param req Express request containing the comment id in params
 * @param res Express response object
 * @param pool Database connection pool
 */
export const deleteComment = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const { id } = req.params;

  try {
    const deletedComment = await commentModel.deleteComment(pool, id);
    if (!deletedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json(deletedComment);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ error: 'Internal server error' });
  }
};
