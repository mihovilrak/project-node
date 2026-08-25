import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Comment } from '../../types/comment';
import {
  getTaskComments,
  createComment,
  editComment,
  deleteComment
} from '../../api/comments';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

export const useTaskComments = (taskId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const { currentUser } = useAuth();

  const fetchComments = async () => {
    if (!taskId) return;
    try {
      const commentsData = await getTaskComments(Number(taskId));
      setComments(commentsData || []);
    } catch (error: unknown) {
      logger.error('Failed to fetch comments:', error);
      setComments([]);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleCommentSubmit = async (content: string) => {
    try {
      if (!currentUser?.id) throw new Error('User not authenticated');
      if (!taskId) throw new Error('Task ID is required');

      const newComment = await createComment(Number(taskId), {
        comment: content
      });

      if (!newComment) {
        throw new Error('Failed to create comment');
      }

      // Check if comment already exists to prevent duplicates
      setComments(prev => {
        const exists = prev.some(c => c?.id === newComment.id);
        if (exists) {
          // If it exists, just refresh the list
          return prev.map(c => c?.id === newComment.id ? newComment : c);
        }
        return [...prev, newComment];
      });
      return newComment;
    } catch (error: unknown) {
      logger.error('Failed to add comment:', error);
      throw new Error(getApiErrorMessage(error, 'Failed to add comment'));
    }
  };

  const handleCommentUpdate = async (commentId: number, newText: string) => {
    try {
      if (!taskId) throw new Error('Task ID is required');

      const updatedComment = await editComment(commentId, Number(taskId), {
        comment: newText
      });

      if (!updatedComment) {
        throw new Error('Failed to update comment');
      }

      setComments(prev => prev.map(c =>
        c?.id === commentId ? updatedComment : c
      ));
      return updatedComment;
    } catch (error: unknown) {
      logger.error('Failed to update comment:', error);
      throw new Error(getApiErrorMessage(error, 'Failed to update comment'));
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    try {
      if (!taskId) throw new Error('Task ID is required');

      await deleteComment(Number(taskId), commentId);
      setComments(prev => prev.filter(c => c?.id !== commentId));
    } catch (error: unknown) {
      logger.error('Failed to delete comment:', error);
      throw new Error(getApiErrorMessage(error, 'Failed to delete comment'));
    }
  };

  return {
    comments,
    setComments,
    handleCommentSubmit,
    handleCommentUpdate,
    handleCommentDelete,
    fetchComments
  };
};
