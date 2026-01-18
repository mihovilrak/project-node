import { useState } from 'react';
import {
  FilterValues,
  FilterPanelOptions,
  FilterOption
} from '../../types/filterPanel';

export const useFilterPanel = (filters: FilterValues, onFilterChange: (filters: FilterValues) => void) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleFilterChange = (field: keyof FilterValues, value: string | number | null): void => {
    const newFilters: FilterValues = {
      ...filters,
      [field]: value
    };
    onFilterChange(newFilters);
  };

  const getDisplayValue = (field: keyof FilterPanelOptions, value: string | number, options: FilterPanelOptions): string => {
    // Map field names to their corresponding option arrays
    const fieldMappings: { [key: string]: string } = {
      'status_id': 'statuses',
      'priority_id': 'priorities',
      'type_id': 'types',
      'assignee_id': 'users',
      'project_id': 'projects'
    };

    const optionField = fieldMappings[field] || field;
    const fieldOption = options[optionField as keyof FilterPanelOptions];

    if (Array.isArray(fieldOption)) {
      const option = fieldOption.find((opt: FilterOption) => String(opt.id) === String(value));
      return option?.name || String(value);
    }
    return String(value);
  };

  const getAppliedFilters = (options: FilterPanelOptions) => {
    return Object.entries(filters)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([field, value]) => ({
        field,
        value,
        displayValue: getDisplayValue(field as keyof FilterPanelOptions, value, options)
      }));
  };

  const handleClearFilters = (): void => {
    onFilterChange({});
    setExpanded(false);
  };

  return {
    expanded,
    setExpanded,
    handleFilterChange,
    getAppliedFilters,
    handleClearFilters
  };
};
