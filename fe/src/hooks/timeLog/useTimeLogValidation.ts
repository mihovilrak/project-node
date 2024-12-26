import { useState } from 'react';

export const useTimeLogValidation = () => {
  const [timeError, setTimeError] = useState<string>('');

  const validateAndFormatTime = (timeStr: string): number | null => {
    setTimeError('');

    const timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    if (timePattern.test(timeStr)) {
      const [hours, minutes] = timeStr.split(':');
      return parseInt(hours) * 60 + parseInt(minutes);
    }

    const decimalHours = parseFloat(timeStr);
    if (!isNaN(decimalHours) && decimalHours > 0) {
      return Math.round(decimalHours * 60);
    }

    setTimeError('Invalid time format. Use HH:MM or decimal hours (e.g., 1:30 or 1.5)');
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
