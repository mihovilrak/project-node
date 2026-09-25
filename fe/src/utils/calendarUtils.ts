import { Task } from '../types/task';
import { TimeLog } from '../types/timeLog';
import { DateInput, toLocalDate } from './dateUtils';
import { toHours } from './timeUtils';

export const WEEKDAY_LABELS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

export const isSameLocalDay = (value: DateInput, day: Date): boolean => {
  const date = toLocalDate(value);
  return Boolean(date) && date!.toDateString() === day.toDateString();
};

/**
 * True when the value carries a time of day. Task dates are plain `date`
 * columns, so they have none and must not be bucketed into the 00:00 slot.
 */
export const hasTimeOfDay = (value: DateInput): boolean =>
  typeof value === 'string'
    ? value.length > 10 && toLocalDate(value) !== null
    : value instanceof Date || typeof value === 'number';

export const getTasksForDay = (tasks: Task[] | undefined, day: Date): Task[] =>
  (Array.isArray(tasks) ? tasks : []).filter(
    (task) =>
      isSameLocalDay(task.start_date, day) ||
      isSameLocalDay(task.end_date, day) ||
      isSameLocalDay(task.due_date, day),
  );

/**
 * Time logs belong to the day the work was done (`log_date`), not the day the
 * entry was created.
 */
export const getTimeLogsForDay = (
  timeLogs: TimeLog[] | undefined,
  day: Date,
): TimeLog[] =>
  (Array.isArray(timeLogs) ? timeLogs : []).filter((log) =>
    isSameLocalDay(log.log_date || log.created_on, day),
  );

export const sumHours = (timeLogs: TimeLog[]): number =>
  timeLogs.reduce((total, log) => total + toHours(log.spent_time), 0);

/**
 * Label for why a task appears on a given day: it starts, is due or ended.
 */
export const getTaskDayLabel = (task: Task, day: Date): string | undefined => {
  if (isSameLocalDay(task.start_date, day)) return 'Starts';
  if (isSameLocalDay(task.due_date, day)) return 'Due';
  if (isSameLocalDay(task.end_date, day)) return 'Ended';
  return undefined;
};
