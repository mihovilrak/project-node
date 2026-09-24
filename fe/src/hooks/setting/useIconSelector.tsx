import { useState, useCallback } from 'react';
import { getAvailableIcons } from '../../api/activityTypes';
import { useAsyncResource } from '../common/useAsyncResource';

const EMPTY_ICONS: string[] = [];

/**
 * Manage icon selection state with async icon loading and modal controls.
 * @param initialValue The initial icon name to select, or undefined for no selection.
 */
export const useIconSelector = (initialValue: string | undefined) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | undefined>(initialValue);

  const { data: icons, error } = useAsyncResource<string[]>(
    async (signal) => (await getAvailableIcons(signal)) || [],
    [],
    { initialData: EMPTY_ICONS, errorMessage: 'Failed to load icons' },
  );

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
