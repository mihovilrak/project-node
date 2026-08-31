export const TaskStatusId = {
  New: 1,
  InProgress: 2,
  OnHold: 3,
  Review: 4,
  Done: 5,
  Cancelled: 6,
  Deleted: 7,
} as const;

export type TaskStatusIdValue =
  (typeof TaskStatusId)[keyof typeof TaskStatusId];

// Statuses a task is still being worked in; excludes Done, Cancelled, Deleted.
export const ACTIVE_TASK_STATUS_IDS: TaskStatusIdValue[] = [
  TaskStatusId.New,
  TaskStatusId.InProgress,
  TaskStatusId.OnHold,
  TaskStatusId.Review,
];
