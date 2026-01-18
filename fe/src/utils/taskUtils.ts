export const getPriorityColor = (priority: string | undefined): "error" | "warning" | "info" | "success" | "default" => {
  switch (priority?.toLowerCase()) {
    case 'very high/must': return 'error';
    case 'high/should': return 'warning';
    case 'normal/could': return 'info';
    case 'low/wont': return 'success';
    default: return 'default';
  }
};