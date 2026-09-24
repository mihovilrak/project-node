import { Request } from 'express';

/**
 * Represents a user comment attached to a task with metadata for tracking creation, updates, and status.
 */
export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  comment: string;
  created_on: Date;
  updated_on: Date;
  active: boolean;
}

export interface CommentCreateInput {
  comment: string;
}

export interface CommentUpdateInput {
  comment: string;
}

export interface CommentWithUser extends Comment {
  user_name: string;
}

export interface TaskRequest extends Request {
  taskId?: string;
}
