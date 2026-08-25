import { User } from './user';

export interface FilterValues {
  search?: string;
  status_id?: number | string;
  priority_id?: number | string;
  type_id?: number | string;
  assignee_id?: number | string;
  holder_id?: number | string;
  project_id?: number | string;
  role_id?: number | string;
  start_date?: string;
  due_date?: string;
  created_from?: string;
  created_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  start_date_from?: string;
  start_date_to?: string;
  created_by?: number | string;
  id?: number | string;
  parent_id?: number | string;
  estimated_time_min?: number | string;
  estimated_time_max?: number | string;
  inactive_statuses_only?: boolean;
  active?: boolean;
}

/** Operator for date filters */
export type DateFilterOperator = 'from' | 'to' | 'between';

/** Operator for dropdown (e.g. Role, Status) filters */
export type DropdownFilterOperator = 'includes' | 'excludes' | 'is';

/** Operator for number filters */
export type NumberFilterOperator = 'equals' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';

/** Operator for text filters */
export type TextFilterOperator = 'contains' | 'starts_with' | 'ends_with' | 'excludes';

export type FilterOperator = DateFilterOperator | DropdownFilterOperator | NumberFilterOperator | TextFilterOperator;

/** Logical date field name (maps to _from / _to keys) */
export type DateLogicalField = 'start_date' | 'due_date' | 'created';

export type ActiveFilterField = keyof FilterValues | DateLogicalField;

/** One active filter row (field + operator + value(s)) */
export interface ActiveFilter {
  id: string;
  field: ActiveFilterField;
  operator: FilterOperator;
  value?: string | number | null;
  value2?: string | number | null;
  /** For dropdown operator "includes": multiple selected option ids */
  valueMulti?: number[];
}

/** Kind of filter field for operator and input UI */
export type FilterFieldKind = 'date' | 'dropdown' | 'number' | 'text';

/** Available filter definition for "Add filter" list */
export interface AvailableFilterDef {
  key: ActiveFilterField;
  label: string;
  kind: FilterFieldKind;
  optionKey?: keyof FilterPanelOptions; // e.g. 'statuses', 'roles' for dropdown options
}

/** Human-readable labels for filter keys (e.g. Status not status_id) */
export const FILTER_FIELD_LABELS: Record<string, string> = {
  status_id: 'Status',
  priority_id: 'Priority',
  type_id: 'Type',
  assignee_id: 'Assignee',
  holder_id: 'Holder',
  project_id: 'Project',
  role_id: 'Role',
  search: 'Search',
  start_date: 'Start Date',
  due_date: 'Due Date',
  created_from: 'Created From',
  created_to: 'Created To',
  due_date_from: 'Due From',
  due_date_to: 'Due To',
  start_date_from: 'Start From',
  start_date_to: 'Start To',
  created_by: 'Created By',
  id: 'ID',
  parent_id: 'Parent Task',
  estimated_time_min: 'Est. Time Min',
  estimated_time_max: 'Est. Time Max',
  inactive_statuses_only: 'Inactive',
  created: 'Created'
};

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
  users?: User[] | FilterOption[];
  projects?: FilterOption[];
  activities?: FilterOption[];
  roles?: FilterOption[];
  search?: boolean;
  showDateFilters?: boolean;
  showSearch?: boolean;
  showActiveOnly?: boolean;
  createdBy?: FilterOption[];
  parent_id?: FilterOption[];
  holders?: FilterOption[];
  due_date_from?: boolean;
  due_date_to?: boolean;
  start_date_from?: boolean;
  start_date_to?: boolean;
  created_from?: boolean;
  created_to?: boolean;
  estimated_time_min?: boolean;
  estimated_time_max?: boolean;
  id?: boolean;
}

/** Map date logical field to FilterValues keys */
export const DATE_FIELD_TO_KEYS: Record<string, { from: keyof FilterValues; to: keyof FilterValues }> = {
  start_date: { from: 'start_date_from', to: 'start_date_to' },
  due_date: { from: 'due_date_from', to: 'due_date_to' },
  created: { from: 'created_from', to: 'created_to' }
};
