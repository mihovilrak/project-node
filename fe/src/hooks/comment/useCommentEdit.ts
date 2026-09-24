import { useState, useEffect } from 'react';
import { Comment } from '../../types/comment';

/**
 * Manage comment editing state and submission with error handling.
 * @param comment The comment object to edit, or null if no comment is selected.
 * @param onSave Callback function invoked with the comment id and updated text after successful submission.
 */
export const useCommentEdit = (
  comment: Comment | null,
  onSave: (id: number, text: string) => Promise<void>,
) => {
  const [editedText, setEditedText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (comment?.comment) {
      setEditedText(comment.comment);
    } else {
      setEditedText('');
    }
  }, [comment?.id, comment?.comment]);

  const handleSave = async (): Promise<void> => {
    if (!comment || !editedText.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      await onSave(comment.id, editedText.trim());
      // Don't reset form here - let the dialog close handler do it
      setIsSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment');
      setIsSubmitting(false);
    }
  };

  const resetForm = (): void => {
    setEditedText('');
    setError('');
  };

  return {
    editedText,
    setEditedText,
    isSubmitting,
    error,
    handleSave,
    resetForm,
  };
};
