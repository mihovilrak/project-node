import { useState, useEffect, useCallback } from 'react';
import { getAvailableIcons } from '../../api/activityTypes';

export const useIconSelector = (initialValue: string | undefined) => {
  const [icons, setIcons] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | undefined>(initialValue);

  useEffect(() => {
    const loadIcons = async () => {
      try {
        const availableIcons = await getAvailableIcons();
        setIcons(availableIcons || []);
      } catch (error) {
        console.error('Failed to load icons:', error);
        setIcons([]);
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
    handleOpen,
    handleClose,
    handleSelect
  };
};
