import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Comment } from '../../types/comment';
import {
  getTaskComments,
  createComment,
  editComment,
  deleteComment
} from '../../api/comments';

export const useTaskComments = (taskId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const { currentUser } = useAuth();

  const fetchComments = async () => {
    try {
      const commentsData = await getTaskComments(Number(taskId));
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleCommentSubmit = async (content: string) => {
    try {
      if (!currentUser?.id) throw new Error('User not authenticated');

      const newComment = await createComment(Number(taskId), {
        comment: content
      });

      setComments(prev => [...prev, newComment]);
      return newComment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const handleCommentUpdate = async (commentId: number, newText: string) => {
    try {
      const updatedComment = await editComment(commentId, Number(taskId), {
        comment: newText
      });

      setComments(prev => prev.map(c =>
        c.id === commentId ? updatedComment : c
      ));
      return updatedComment;
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error;
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    try {
      await deleteComment(Number(taskId), commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
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
