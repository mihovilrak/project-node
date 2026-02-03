import { useState, useEffect, useCallback } from 'react';
import {
  FilterValues,
  FilterPanelOptions,
  FilterOption,
  FILTER_FIELD_LABELS,
  ActiveFilter,
  ActiveFilterField,
  DateFilterOperator,
  DropdownFilterOperator,
  NumberFilterOperator,
  TextFilterOperator,
  DATE_FIELD_TO_KEYS,
  AvailableFilterDef
} from '../../types/filterPanel';

const DROPDOWN_FIELDS: ActiveFilterField[] = [
  'status_id',
  'priority_id',
  'type_id',
  'assignee_id',
  'holder_id',
  'project_id',
  'role_id',
  'created_by',
  'parent_id'
];
const DATE_LOGICAL_FIELDS = ['start_date', 'due_date', 'created'] as const;
const NUMBER_FIELDS: ActiveFilterField[] = ['id', 'estimated_time_min', 'estimated_time_max'];

function generateId(): string {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function filtersToActiveFilters(filters: FilterValues): ActiveFilter[] {
  const result: ActiveFilter[] = [];
  const seen = new Set<string>();

  for (const logical of DATE_LOGICAL_FIELDS) {
    const keys = DATE_FIELD_TO_KEYS[logical];
    const fromVal = filters[keys.from];
    const toVal = filters[keys.to];
    if (fromVal && toVal) {
      result.push({ id: generateId(), field: logical, operator: 'between', value: String(fromVal), value2: String(toVal) });
      seen.add(logical);
    } else if (fromVal) {
      result.push({ id: generateId(), field: logical, operator: 'from', value: String(fromVal) });
      seen.add(logical);
    } else if (toVal) {
      result.push({ id: generateId(), field: logical, operator: 'to', value: String(toVal) });
      seen.add(logical);
    }
  }

  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined || value === '') continue;
    const k = key as keyof FilterValues;
    if (key === 'start_date_from' || key === 'start_date_to' || key === 'due_date_from' || key === 'due_date_to' || key === 'created_from' || key === 'created_to') continue;
    if (DROPDOWN_FIELDS.includes(k as ActiveFilterField)) {
      const strVal = String(value);
      const multi = strVal.includes(',') ? strVal.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n)) : null;
      if (multi && multi.length > 1) {
        result.push({ id: generateId(), field: k, operator: 'includes' as DropdownFilterOperator, valueMulti: multi });
      } else if (multi && multi.length === 1) {
        result.push({ id: generateId(), field: k, operator: 'includes' as DropdownFilterOperator, value: multi[0], valueMulti: multi });
      } else {
        const num = typeof value === 'number' ? value : Number(value) || value;
        result.push({ id: generateId(), field: k, operator: 'includes' as DropdownFilterOperator, value: num });
      }
      continue;
    }
    if (k === 'search') {
      result.push({ id: generateId(), field: 'search', operator: 'contains' as TextFilterOperator, value: String(value) });
      continue;
    }
    if (NUMBER_FIELDS.includes(k as ActiveFilterField)) {
      result.push({ id: generateId(), field: k, operator: 'equals' as NumberFilterOperator, value: typeof value === 'number' ? value : Number(value) || value });
      continue;
    }
    if (k === 'inactive_statuses_only') {
      result.push({ id: generateId(), field: k, operator: 'is', value: value ? 1 : 0 });
      continue;
    }
    result.push({ id: generateId(), field: k, operator: 'equals', value: value as string | number });
  }
  return result;
}

function activeFiltersToFilterValues(activeFilters: ActiveFilter[]): FilterValues {
  const out: Record<string, string | number | boolean | undefined> = {};
  for (const af of activeFilters) {
    if (af.field === 'start_date' || af.field === 'due_date' || af.field === 'created') {
      const keys = DATE_FIELD_TO_KEYS[af.field];
      if (af.operator === 'from' && af.value != null) out[keys.from as string] = String(af.value);
      else if (af.operator === 'to' && af.value != null) out[keys.to as string] = String(af.value);
      else if (af.operator === 'between') {
        if (af.value != null) out[keys.from as string] = String(af.value);
        if (af.value2 != null) out[keys.to as string] = String(af.value2);
      }
      continue;
    }
    const key = af.field as keyof FilterValues;
    if (af.operator === 'between' && (af.field === 'estimated_time_min' || af.field === 'estimated_time_max')) {
      if (af.value != null) out.estimated_time_min = Number(af.value);
      if (af.value2 != null) out.estimated_time_max = Number(af.value2);
      continue;
    }
    if (af.operator === 'excludes') {
      continue;
    }
    if (af.operator === 'includes' && af.valueMulti && af.valueMulti.length > 0) {
      out[key] = af.valueMulti.length === 1 ? af.valueMulti[0] : af.valueMulti.join(',');
      continue;
    }
    if (af.value != null && af.value !== '') {
      if (key === 'inactive_statuses_only') {
        out[key] = Boolean(af.value);
      } else {
        out[key] = typeof af.value === 'number' ? af.value : af.value;
      }
    }
  }
  return out as FilterValues;
}

export function getAvailableFilters(
  type: 'tasks' | 'projects' | 'users' | 'time_logs',
  options: FilterPanelOptions
): AvailableFilterDef[] {
  const list: AvailableFilterDef[] = [];
  if (options.search) list.push({ key: 'search', label: FILTER_FIELD_LABELS.search || 'Search', kind: 'text' });
  if (options.statuses?.length) list.push({ key: 'status_id', label: FILTER_FIELD_LABELS.status_id || 'Status', kind: 'dropdown', optionKey: 'statuses' });
  if (options.roles?.length) list.push({ key: 'role_id', label: FILTER_FIELD_LABELS.role_id || 'Role', kind: 'dropdown', optionKey: 'roles' });
  if (options.priorities?.length) list.push({ key: 'priority_id', label: FILTER_FIELD_LABELS.priority_id || 'Priority', kind: 'dropdown', optionKey: 'priorities' });
  if (options.types?.length) list.push({ key: 'type_id', label: FILTER_FIELD_LABELS.type_id || 'Type', kind: 'dropdown', optionKey: 'types' });
  if (options.projects?.length) list.push({ key: 'project_id', label: FILTER_FIELD_LABELS.project_id || 'Project', kind: 'dropdown', optionKey: 'projects' });
  if (options.users?.length) {
    list.push({ key: 'assignee_id', label: FILTER_FIELD_LABELS.assignee_id || 'Assignee', kind: 'dropdown', optionKey: 'users' });
    if (type === 'tasks') {
      list.push({ key: 'holder_id', label: FILTER_FIELD_LABELS.holder_id || 'Holder', kind: 'dropdown', optionKey: 'holders' });
      list.push({ key: 'created_by', label: FILTER_FIELD_LABELS.created_by || 'Created By', kind: 'dropdown', optionKey: 'createdBy' });
    }
  }
  if (options.parent_id?.length && type === 'tasks') list.push({ key: 'parent_id', label: FILTER_FIELD_LABELS.parent_id || 'Parent Task', kind: 'dropdown', optionKey: 'parent_id' });
  if (options.createdBy?.length && type === 'projects') list.push({ key: 'created_by', label: FILTER_FIELD_LABELS.created_by || 'Created By', kind: 'dropdown', optionKey: 'createdBy' });
  if (options.start_date_from || options.start_date_to) list.push({ key: 'start_date', label: FILTER_FIELD_LABELS.start_date || 'Start Date', kind: 'date' });
  if (options.due_date_from || options.due_date_to) list.push({ key: 'due_date', label: FILTER_FIELD_LABELS.due_date || 'Due Date', kind: 'date' });
  if (options.created_from || options.created_to) list.push({ key: 'created', label: FILTER_FIELD_LABELS.created || 'Created', kind: 'date' });
  if (options.id && type === 'tasks') list.push({ key: 'id', label: FILTER_FIELD_LABELS.id || 'ID', kind: 'number' });
  if (options.estimated_time_min || options.estimated_time_max) list.push({ key: 'estimated_time_min', label: FILTER_FIELD_LABELS.estimated_time_min || 'Est. Time', kind: 'number' });
  if (options.showActiveOnly && type === 'tasks') list.push({ key: 'inactive_statuses_only', label: FILTER_FIELD_LABELS.inactive_statuses_only || 'Inactive', kind: 'dropdown' });
  return list;
}

const getDefaultOperator = (kind: AvailableFilterDef['kind']): ActiveFilter['operator'] => {
  if (kind === 'date') return 'from';
  if (kind === 'dropdown') return 'is';
  if (kind === 'number') return 'equals';
  return 'contains';
};

export const useFilterPanel = (
  filters: FilterValues,
  onFilterChange: (filters: FilterValues) => void,
  options: FilterPanelOptions,
  type: 'tasks' | 'projects' | 'users' | 'time_logs'
) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(() => filtersToActiveFilters(filters));

  useEffect(() => {
    const next = filtersToActiveFilters(filters);
    setActiveFilters((prev) => {
      if (Object.keys(filters).length === 0 && prev.length > 0) return prev;
      if (prev.length !== next.length) return next;
      const same =
        next.length > 0 &&
        prev.every((p, i) => {
          const n = next[i];
          if (i >= next.length || p.field !== n.field || p.operator !== n.operator) return false;
          if (String(p.value) !== String(n.value) || String(p.value2 ?? '') !== String(n.value2 ?? '')) return false;
          const pMulti = (p as ActiveFilter).valueMulti?.slice().sort().join(',') ?? '';
          const nMulti = n.valueMulti?.slice().sort().join(',') ?? '';
          return pMulti === nMulti;
        });
      return same ? prev : next;
    });
  }, [filters]);

  const flushToParent = useCallback(
    (next: ActiveFilter[]) => {
      onFilterChange(activeFiltersToFilterValues(next));
    },
    [onFilterChange]
  );

  const handleFilterChange = (field: keyof FilterValues, value: string | number | null): void => {
    const newFilters: FilterValues = { ...filters, [field]: value };
    onFilterChange(newFilters);
  };

  const getDisplayValue = (field: keyof FilterPanelOptions, value: string | number, optionsMap: FilterPanelOptions): string => {
    const fieldMappings: Record<string, string> = {
      status_id: 'statuses',
      priority_id: 'priorities',
      type_id: 'types',
      assignee_id: 'users',
      holder_id: 'users',
      project_id: 'projects',
      role_id: 'roles',
      created_by: 'users',
      parent_id: 'parent_id'
    };
    const optionField = fieldMappings[field] || field;
    const fieldOption = optionsMap[optionField as keyof FilterPanelOptions];
    if (Array.isArray(fieldOption)) {
      const option = fieldOption.find((opt: FilterOption) => String(opt.id) === String(value));
      return option?.name || String(value);
    }
    return String(value);
  };

  const getAppliedFilters = (optionsMap: FilterPanelOptions) => {
    return activeFilters
      .filter(
        (af) =>
          (af.value != null && af.value !== '') ||
          (af.valueMulti && af.valueMulti.length > 0) ||
          (af.operator === 'between' && af.value2 != null)
      )
      .map((af) => {
        const fieldKey = typeof af.field === 'string' && DATE_FIELD_TO_KEYS[af.field] ? af.field : af.field;
        const displayLabel = FILTER_FIELD_LABELS[fieldKey as string] || fieldKey;
        let displayValue = String(af.value ?? '');
        if (af.operator === 'between' && af.value2 != null) displayValue = `${af.value} – ${af.value2}`;
        else if (af.field === 'inactive_statuses_only') displayValue = af.value ? 'Inactive' : 'Active';
        else if (af.operator === 'includes' && af.valueMulti && af.valueMulti.length > 0 && optionsMap) {
          const optionKeyMap: Record<string, keyof FilterPanelOptions> = {
            status_id: 'statuses',
            priority_id: 'priorities',
            type_id: 'types',
            assignee_id: 'users',
            holder_id: 'holders',
            project_id: 'projects',
            role_id: 'roles',
            created_by: 'createdBy',
            parent_id: 'parent_id'
          };
          const optionKey = optionKeyMap[af.field as string] ?? af.field;
          const arr = optionsMap[optionKey];
          if (Array.isArray(arr)) {
            displayValue = af.valueMulti!.map((id) => arr.find((o: FilterOption) => String(o.id) === String(id))?.name ?? id).join(', ');
          } else displayValue = af.valueMulti!.join(', ');
        } else if (DROPDOWN_FIELDS.includes(af.field as ActiveFilterField) && optionsMap) {
          const optionKeyMap: Record<string, keyof FilterPanelOptions> = {
            status_id: 'statuses',
            priority_id: 'priorities',
            type_id: 'types',
            assignee_id: 'users',
            holder_id: 'holders',
            project_id: 'projects',
            role_id: 'roles',
            created_by: 'createdBy',
            parent_id: 'parent_id'
          };
          const optionKey = optionKeyMap[af.field as string] ?? af.field;
          const arr = optionsMap[optionKey];
          if (Array.isArray(arr)) {
            const opt = arr.find((o: FilterOption) => String(o.id) === String(af.value));
            displayValue = opt?.name ?? displayValue;
          }
        }
        return { id: af.id, field: af.field, value: af.value, displayLabel, displayValue };
      });
  };

  /** Chips show applied state (from parent filters), not staged. */
  const getAppliedFiltersFromValues = useCallback(
    (appliedFilters: FilterValues, optionsMap: FilterPanelOptions) => {
      const result: { id: string; field: string; displayLabel: string; displayValue: string }[] = [];
      const optionKeyMap: Record<string, keyof FilterPanelOptions> = {
        status_id: 'statuses',
        priority_id: 'priorities',
        type_id: 'types',
        assignee_id: 'users',
        holder_id: 'holders',
        project_id: 'projects',
        role_id: 'roles',
        created_by: 'createdBy',
        parent_id: 'parent_id'
      };
      for (const logical of DATE_LOGICAL_FIELDS) {
        const keys = DATE_FIELD_TO_KEYS[logical];
        const fromVal = appliedFilters[keys.from as keyof FilterValues];
        const toVal = appliedFilters[keys.to as keyof FilterValues];
        if (fromVal && toVal) {
          result.push({
            id: logical,
            field: logical,
            displayLabel: FILTER_FIELD_LABELS[logical] || logical,
            displayValue: `${fromVal} – ${toVal}`
          });
        } else if (fromVal) {
          result.push({
            id: logical,
            field: logical,
            displayLabel: FILTER_FIELD_LABELS[logical] || logical,
            displayValue: String(fromVal)
          });
        } else if (toVal) {
          result.push({
            id: logical,
            field: logical,
            displayLabel: FILTER_FIELD_LABELS[logical] || logical,
            displayValue: String(toVal)
          });
        }
      }
      const dateKeys = new Set(['start_date_from', 'start_date_to', 'due_date_from', 'due_date_to', 'created_from', 'created_to']);
      for (const [key, value] of Object.entries(appliedFilters)) {
        if (value === null || value === undefined || value === '') continue;
        if (dateKeys.has(key)) continue;
        const k = key as keyof FilterValues;
        const displayLabel = FILTER_FIELD_LABELS[key] || key;
        let displayValue = String(value);
        if (k === 'inactive_statuses_only') displayValue = value ? 'Inactive' : 'Active';
        else if (DROPDOWN_FIELDS.includes(k as ActiveFilterField) && optionsMap) {
          const optionKey = optionKeyMap[k as string] ?? k;
          const arr = optionsMap[optionKey];
          if (Array.isArray(arr)) {
            const strVal = String(value);
            if (strVal.includes(',')) {
              const ids = strVal.split(',').map((s) => s.trim());
              displayValue = ids.map((id) => arr.find((o: FilterOption) => String(o.id) === id)?.name ?? id).join(', ');
            } else {
              const opt = arr.find((o: FilterOption) => String(o.id) === String(value));
              displayValue = opt?.name ?? displayValue;
            }
          }
        }
        result.push({ id: key, field: key, displayLabel, displayValue });
      }
      return result;
    },
    []
  );

  const removeAppliedFilter = useCallback(
    (chipId: string) => {
      const next = { ...filters };
      if (DATE_FIELD_TO_KEYS[chipId]) {
        const keys = DATE_FIELD_TO_KEYS[chipId];
        delete next[keys.from as keyof FilterValues];
        delete next[keys.to as keyof FilterValues];
      } else {
        delete next[chipId as keyof FilterValues];
      }
      onFilterChange(next);
    },
    [filters, onFilterChange]
  );

  const handleClearFilters = (): void => {
    setActiveFilters([]);
  };

  const addFilter = (def: AvailableFilterDef): void => {
    const operator = getDefaultOperator(def.kind);
    const newFilter: ActiveFilter = {
      id: generateId(),
      field: def.key,
      operator,
      value: undefined,
      value2: undefined
    };
    const next = [...activeFilters, newFilter];
    setActiveFilters(next);
    // Do not flush when adding a filter with no value - avoids parent re-render that can collapse the panel.
  };

  const applyFilters = useCallback(() => {
    flushToParent(activeFilters);
  }, [activeFilters, flushToParent]);

  const removeFilter = (id: string): void => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<Pick<ActiveFilter, 'operator' | 'value' | 'value2' | 'valueMulti'>>): void => {
    setActiveFilters((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const next = { ...f, ...updates };
        if (updates.operator === 'includes') {
          if (next.valueMulti == null) next.valueMulti = next.value != null ? [Number(next.value)] : [];
        }
        if (updates.operator === 'is' || updates.operator === 'excludes') {
          if (next.valueMulti != null) {
            next.value = next.valueMulti[0] ?? next.value;
            next.valueMulti = undefined;
          }
        }
        return next;
      })
    );
  };

  const availableFilters = getAvailableFilters(type, options);

  return {
    expanded,
    setExpanded,
    handleFilterChange,
    getAppliedFilters,
    getAppliedFiltersFromValues,
    removeAppliedFilter,
    handleClearFilters,
    activeFilters,
    addFilter,
    removeFilter,
    updateFilter,
    applyFilters,
    availableFilters
  };
};
