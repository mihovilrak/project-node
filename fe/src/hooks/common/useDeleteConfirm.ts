import { useState } from 'react';

export const useDeleteConfirm = (onConfirm: () => void, onClose: () => void) => {
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
    handleConfirm
  };
};
