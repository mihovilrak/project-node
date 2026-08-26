// Ids seeded by db/init/408_DATA_task_statuses.sql. Kept here so no call site
// has to remember that "deleted" is 7 for tasks but 3 for users and projects.
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
export const ACTIVE_TASK_STATUS_IDS: number[] = [
  TaskStatusId.New,
  TaskStatusId.InProgress,
  TaskStatusId.OnHold,
  TaskStatusId.Review,
];
