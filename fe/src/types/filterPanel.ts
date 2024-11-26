import { User } from './user';

// Base filter values interface
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

// Common filter option structure
export interface FilterOption {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

// Filter panel base props
export interface FilterPanelProps {
  type: 'tasks' | 'projects' | 'users' | 'time_logs';
  filters: FilterValues;
  onFilterChange: (newFilters: FilterValues) => void;
  options: FilterPanelOptions;
}

// Available filter options
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

// Date range filter props
export interface DateRangeFilterProps {
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (date: string | null) => void;
  onEndDateChange: (date: string | null) => void;
  startLabel?: string;
  endLabel?: string;
}

// Select filter props
export interface SelectFilterProps {
  value: number | string | null;
  options: FilterOption[];
  onChange: (value: number | string | null) => void;
  label: string;
  multiple?: boolean;
}

// Search filter props
export interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

// Active filter props
export interface ActiveFilterProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

// Applied filter display
export interface AppliedFilter {
  field: string;
  value: string | number | boolean;
  label: string;
  displayValue: string;
}

// Applied filters props
export interface AppliedFiltersProps {
  filters: FilterValues;
  options: FilterPanelOptions;
  onRemove: (field: string) => void;
  onClearAll: () => void;
} 