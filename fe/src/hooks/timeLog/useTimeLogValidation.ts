import { useState } from 'react';

export const useTimeLogValidation = () => {
  const [timeError, setTimeError] = useState<string>('');

  const validateAndFormatTime = (timeStr: string): number | null => {
    setTimeError('');

    const decimalHours = parseFloat(timeStr);
    if (!isNaN(decimalHours) && decimalHours > 0) {
      return Math.round(decimalHours * 60);
    }

    setTimeError('Please enter a valid number of hours (e.g., 1, 1.5, 2)');
    return null;
  };

  const validateTime = (spentTime: string): boolean => {
    const timeInMinutes = validateAndFormatTime(spentTime);
    return timeInMinutes !== null;
  };

  return {
    timeError,
    validateTime,
    validateAndFormatTime,
  };
};
