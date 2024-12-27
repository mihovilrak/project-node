import { Request, Response } from 'express';
import { Pool } from 'pg';
import * as commentModel from '../models/commentModel';
import * as notificationModel from '../models/notificationModel';
import { CustomRequest } from '../types/express';
import { CommentCreateInput, CommentUpdateInput, TaskRequest } from '../types/comment';

// Get task comments
export const getTaskComments = async (req: TaskRequest, res: Response, pool: Pool): Promise<void> => {
  try {
    const taskId = req.taskId;
    const comments = await commentModel.getTaskComments(pool, taskId);
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a comment
export const createComment = async (req: CustomRequest & TaskRequest, res: Response, pool: Pool): Promise<void> => {
  try {
    const taskId = req.taskId;
    const { comment } = req.body as CommentCreateInput;
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const newComment = await commentModel.createComment(
      pool,
      taskId,
      userId,
      comment
    );

    // Create notifications for watchers
    await notificationModel.createWatcherNotifications(pool, {
      task_id: taskId,
      action_user_id: userId,
      type_id: 'task_commented'
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Edit a comment
export const editComment = async (req: Request, res: Response, pool: Pool): Promise<void> => {
  const { id } = req.params;
  const { comment } = req.body as CommentUpdateInput;

  try {
    const editedComment = await commentModel.editComment(pool, id, comment);
    res.status(200).json(editedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response, pool: Pool): Promise<void> => {
  const { id } = req.params;

  try {
    const deletedComment = await commentModel.deleteComment(pool, id);
    res.status(200).json(deletedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
