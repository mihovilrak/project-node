import { useState, useEffect, useCallback } from 'react';
import { getAvailableIcons } from '../../api/activityTypes';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

export const useIconSelector = (initialValue: string | undefined) => {
  const [icons, setIcons] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | undefined>(initialValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIcons = async () => {
      try {
        const availableIcons = await getAvailableIcons();
        setIcons(availableIcons || []);
      } catch (err) {
        logger.error('Failed to load icons:', err);
        setIcons([]);
        setError(getApiErrorMessage(err, 'Failed to load icons'));
      }
    };
    loadIcons();
  }, []);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleSelect = useCallback((icon: string) => {
    setValue(icon);
    setOpen(false);
  }, []);

  return {
    icons,
    open,
    value,
    error,
    handleOpen,
    handleClose,
    handleSelect,
  };
};
