import { useState } from 'react';

export const useTimeLogValidation = () => {
  const [timeError, setTimeError] = useState<string>('');

  const validateAndFormatTime = (timeStr: string): number | null => {
    setTimeError('');

    const decimalHours = parseFloat(timeStr);
    if (!isNaN(decimalHours) && decimalHours > 0) {
      // Return hours as is, no conversion needed
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
