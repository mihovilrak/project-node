import { useState } from 'react';
import {
  FilterValues,
  FilterPanelOptions,
  FilterOption
} from '../types/filterPanel';

export const useFilterPanel = (filters: FilterValues, onFilterChange: (filters: FilterValues) => void) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleFilterChange = (field: keyof FilterValues, value: string | number | null): void => {
    const newFilters: FilterValues = {
      ...filters,
      [field]: value
    };
    onFilterChange(newFilters);
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

  const getDisplayValue = (field: keyof FilterPanelOptions, value: string | number, options: FilterPanelOptions): string => {
    const fieldOption = options[field];
    if (Array.isArray(fieldOption)) {
      const option = fieldOption.find((opt: FilterOption) => String(opt.id) === String(value));
      return option ? option.name : String(value);
    }
    return String(value);
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