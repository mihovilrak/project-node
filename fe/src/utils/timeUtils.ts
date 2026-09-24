/**
 * Convert a numeric or string input into a finite number of hours, returning 0 for null, undefined, non-numeric, or infinite values.
 * @param value A number, string, null, or undefined representing hours; if a string it is parsed with Number.parseFloat. If the parsed or provided value is not a finite number, the function returns 0.
 */
export const toHours = (value: number | string | null | undefined): number => {
  const hours = typeof value === 'string' ? Number.parseFloat(value) : value;
  return typeof hours === 'number' && Number.isFinite(hours) ? hours : 0;
};

/**
 * Format a numeric or string hour input into a clock-style "H:MM" string.
 * @param value Hour value to format; may be a number, numeric string, null, or undefined. Null/undefined or non-numeric inputs are treated as 0; fractional hours are converted to minutes (rounded to the nearest minute).
 */
export const formatHoursClock = (
  value: number | string | null | undefined,
): string => {
  const hours = toHours(value);
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Return a human-readable duration string in the form '<hours>h <minutes>m' for the given hours input.
 * @param value Numeric or string input representing hours; may be null or undefined. Converted to a finite hour count via toHours before formatting.
 * @returns A string formatted as '<wholeHours>h <minutes>m' where minutes is the remaining fractional hours converted to minutes and rounded to the nearest whole minute.
 */
export const formatHoursDuration = (
  value: number | string | null | undefined,
): string => {
  const hours = toHours(value);
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
};
