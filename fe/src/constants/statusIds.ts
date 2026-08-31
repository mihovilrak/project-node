export const TaskStatusId = {
  New: 1,
  InProgress: 2,
  OnHold: 3,
  Review: 4,
  Done: 5,
  Cancelled: 6,
  Deleted: 7,
} as const;

export const ProjectStatusId = {
  Active: 1,
  Inactive: 2,
  Deleted: 3,
} as const;

export const UserStatusId = {
  Active: 1,
  Inactive: 2,
  Deleted: 3,
} as const;
