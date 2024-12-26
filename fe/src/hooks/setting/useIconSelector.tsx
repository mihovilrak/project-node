import { useState, useEffect, useCallback } from 'react';
import { getActivityTypes } from '../../api/activityTypes';
import { ActivityType } from '../../types/timeLog';

export const useIconSelector = (initialValue: string | undefined) => {
  const [icons, setIcons] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | undefined>(initialValue);

  useEffect(() => {
    const loadIcons = async () => {
      try {
        const response: ActivityType[] = await getActivityTypes();
        setIcons(response.map(type => type.icon).filter(Boolean) as string[]);
      } catch (error) {
        console.error('Failed to load icons:', error);
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
