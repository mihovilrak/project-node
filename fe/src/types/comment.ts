export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  comment: string;
  active: boolean;
  created_on: string;
  updated_on: string | null;
  user_name?: string;
  user_avatar?: string;
}

export interface CommentFormProps {
  taskId: number;
  onCommentAdded: (comment: Comment) => void;
}

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

export interface CommentError {
  error: string;
  details?: string;
}

export interface TaskCommentSectionProps {
  taskId: number;
  comments: Comment[];
  editingComment: Comment | null;
  onCommentSubmit: (text: string) => Promise<void>;
  onCommentUpdate: (commentId: number, text: string) => Promise<void>;
  onCommentDelete: (commentId: number) => Promise<void>;
  onEditStart: (comment: Comment) => void;
  onEditEnd: () => void;
}
