import { useState } from 'react';

/**
 * Manage delete confirmation state and handle the deletion workflow with loading indicators.
 * @param onConfirm Callback invoked when the user confirms the deletion action.
 * @param onClose Callback invoked after the deletion completes to close the confirmation dialog.
 */
export const useDeleteConfirm = (
  onConfirm: () => void,
  onClose: () => void,
) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return {
    isDeleting,
    handleConfirm,
  };
};
