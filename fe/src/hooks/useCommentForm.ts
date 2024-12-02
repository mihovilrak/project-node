import { useState } from 'react';
import { createComment } from '../api/comments';
import {
    Comment, 
    CommentError 
} from '../types/comment';

export const useCommentForm = (taskId: number, onCommentAdded: (comment: Comment) => void) => {
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const newComment = await createComment(taskId, {
        comment: comment.trim()
      });
      
      onCommentAdded(newComment);
      setComment('');
    } catch (err) {
      const error = err as CommentError;
      setError(error.error || 'Failed to add comment');
      console.error('Error adding comment:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    comment,
    setComment,
    loading,
    error,
    handleSubmit
  };
}; 