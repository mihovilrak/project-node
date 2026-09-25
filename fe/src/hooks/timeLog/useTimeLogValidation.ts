import { useState } from 'react';

// The API rejects a single entry above one day.
export const MAX_LOG_HOURS = 24;

/**
 * Validate and format time entries as decimal hours with error messaging.
 */
export const useTimeLogValidation = () => {
  const [timeError, setTimeError] = useState<string>('');

  const validateAndFormatTime = (timeStr: string): number | null => {
    setTimeError('');

    const decimalHours = parseFloat(timeStr);
    if (!isNaN(decimalHours) && decimalHours > 0) {
      if (decimalHours > MAX_LOG_HOURS) {
        setTimeError(`Time spent cannot exceed ${MAX_LOG_HOURS} hours`);
        return null;
      }
      return decimalHours;
    }

    setTimeError('Please enter a valid number of hours (e.g., 1, 1.5, 2)');
    return null;
  };

  const validateTime = (spentTime: string): boolean => {
    const timeInHours = validateAndFormatTime(spentTime);
    return timeInHours !== null;
  };

  return {
    timeError,
    validateTime,
    validateAndFormatTime,
  };
};
