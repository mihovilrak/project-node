import { User } from './user';

export interface FilterValues {
  search?: string;
  status_id?: number | string;
  priority_id?: number | string;
  type_id?: number | string;
  assignee_id?: number | string;
  holder_id?: number | string;
  project_id?: number | string;
  start_date?: string;
  due_date?: string;
  created_from?: string;
  created_to?: string;
  active?: boolean;
}

export interface FilterOption {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

export interface FilterPanelProps {
  type: 'tasks' | 'projects' | 'users' | 'time_logs';
  filters: FilterValues;
  onFilterChange: (newFilters: FilterValues) => void;
  options: FilterPanelOptions;
}

export interface FilterPanelOptions {
  statuses?: FilterOption[];
  priorities?: FilterOption[];
  types?: FilterOption[];
  users?: User[];
  projects?: FilterOption[];
  activities?: FilterOption[];
  showDateFilters?: boolean;
  showSearch?: boolean;
  showActiveOnly?: boolean;
}
