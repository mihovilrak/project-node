export const getPriorityColor = (priority: string | undefined): "error" | "warning" | "info" | "success" | "default" => {
  switch (priority?.toLowerCase()) {
    case 'very high/must': return 'error';
    case 'high/should': return 'warning';
    case 'normal/could': return 'info';
    case 'low/wont': return 'success';
    default: return 'default';
  }
};

export const getStatusColor = (status: string | undefined): "error" | "warning" | "info" | "success" | "default" => {
  switch (status?.toLowerCase()) {
    case 'done': return 'success';
    case 'in progress': return 'info';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

/** Chip props for status: use hex when provided, else MUI color name */
export const chipPropsForStatus = (
  statusName?: string,
  statusColor?: string
): { color?: "error" | "warning" | "info" | "success" | "default"; sx?: { backgroundColor: string; color: string } } => {
  if (statusColor) {
    return { sx: { backgroundColor: statusColor, color: '#fff' } };
  }
  return { color: getStatusColor(statusName) };
};

/** Chip props for priority: use hex when provided, else MUI color name */
export const chipPropsForPriority = (
  priorityName?: string,
  priorityColor?: string
): { color?: "error" | "warning" | "info" | "success" | "default"; sx?: { backgroundColor: string; color: string } } => {
  if (priorityColor) {
    return { sx: { backgroundColor: priorityColor, color: '#fff' } };
  }
  return { color: getPriorityColor(priorityName || '') };
};