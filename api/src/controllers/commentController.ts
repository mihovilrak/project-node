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
import { sessionUserId } from '../utils/sessionUser';
import { withTransaction } from '../utils/transaction';

export const MAX_COMMENT_LENGTH = 400;

const commentError = (comment: unknown): string | null => {
  if (typeof comment !== 'string' || comment.trim() === '') {
    return 'Comment text is required';
  }
  if (comment.length > MAX_COMMENT_LENGTH) {
    return `Comment must be at most ${MAX_COMMENT_LENGTH} characters`;
  }
  return null;
};

/** Return the active comments of the task in the route. */
export const getTaskComments = async (
  req: TaskRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const comments = await commentModel.getTaskComments(pool, req.taskId || '');
  res.status(200).json(comments);
};

/**
 * Add a comment to the task in the route and notify its watchers in the same transaction.
 * @param req Request with the session user, task id and `{ comment }` body
 * @param res Response: 201 with the comment, or 400 for empty or overlong text
 * @param pool Database connection pool
 */
export const createComment = async (
  req: CustomRequest & TaskRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const userId = sessionUserId(req);
  const taskId = req.taskId || '';
  const { comment } = (req.body ?? {}) as CommentCreateInput;

  const invalid = commentError(comment);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }

  const newComment = await withTransaction(pool, async (client) => {
    const created = await commentModel.createComment(
      client,
      taskId,
      userId,
      comment,
    );
    await notificationModel.createWatcherNotifications(client, {
      action_user_id: Number(userId),
      type: NotificationType.TaskComment,
      task_id: Number(taskId),
    });
    return created;
  });

  res.status(201).json(newComment);
};

/**
 * Update the text of a comment on the task in the route.
 * @param req Request with the comment id in params and `{ comment }` body
 * @param res Response: 200 with the comment, 400 for invalid text, 404 if it is not an active comment on this task
 * @param pool Database connection pool
 */
export const editComment = async (
  req: Request & TaskRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const { comment } = (req.body ?? {}) as CommentUpdateInput;

  const invalid = commentError(comment);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }

  const editedComment = await commentModel.editComment(
    pool,
    req.params.id,
    req.taskId || '',
    comment,
  );
  if (!editedComment) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  res.status(200).json(editedComment);
};

/**
 * Soft-delete a comment on the task in the route.
 * @param req Request with the comment id in params
 * @param res Response: 200 with the comment, or 404 if it is not an active comment on this task
 * @param pool Database connection pool
 */
export const deleteComment = async (
  req: Request & TaskRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const deletedComment = await commentModel.deleteComment(
    pool,
    req.params.id,
    req.taskId || '',
  );
  if (!deletedComment) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  res.status(200).json(deletedComment);
};
