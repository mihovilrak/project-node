export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  user_name?: string;
  user_avatar?: string;
  comment: string;
  active: boolean;
  created_on: string;
  updated_on: string | null;
}

export interface CommentFormProps {
  onSubmit: (text: string) => Promise<unknown>;
  disabled?: boolean;
}

/**
 * Provide properties for rendering a task's comment list and handling comment
 * updates and deletions while optionally identifying the current user.
 */
export interface CommentListProps {
  comments: Comment[];
  onCommentUpdated: (commentId: number, newText: string) => Promise<void>;
  onCommentDeleted: (commentId: number) => Promise<void>;
  currentUserId?: number;
}

export interface CommentEditDialogProps {
  open: boolean;
  comment: Comment | null;
  onClose: () => void;
  onSave: (commentId: number, newText: string) => Promise<void>;
}

export interface TaskCommentSectionProps {
  taskId: number;
  comments: Comment[];
  onCommentSubmit: (text: string) => Promise<void>;
  onCommentUpdate: (commentId: number, text: string) => Promise<void>;
  onCommentDelete: (commentId: number) => Promise<void>;
}
