import { useState } from 'react';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

/**
 * Manage the new-comment input and its submission state.
 *
 * @param onSubmit Persists the trimmed comment text; rejections are shown as
 *   the form error.
 */
export const useCommentForm = (
  onSubmit: (text: string) => Promise<unknown>,
) => {
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await onSubmit(comment.trim());
      setComment('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add comment'));
      logger.error('Error adding comment:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    comment,
    setComment,
    loading,
    error,
    handleSubmit,
  };
};
