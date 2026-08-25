import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useFilterPanel } from '../useFilterPanel';
import { FilterValues, FilterPanelOptions } from '../../../types/filterPanel';

describe('useFilterPanel', () => {
  const mockOnFilterChange = jest.fn();

  const initialFilters: FilterValues = {
    search: 'test',
    status_id: 1,
    priority_id: 2
  };

  const mockOptions: FilterPanelOptions = {
    statuses: [
      { id: 1, name: 'Active' },
      { id: 2, name: 'Inactive' }
    ],
    priorities: [
      { id: 1, name: 'High' },
      { id: 2, name: 'Low' }
    ],
    users: []
  };

  const type = 'tasks';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useFilterPanel(initialFilters, mockOnFilterChange, mockOptions, type)
    );

    expect(result.current.expanded).toBe(false);
  });

  it('should handle filter changes correctly', () => {
    const { result } = renderHook(() =>
      useFilterPanel(initialFilters, mockOnFilterChange, mockOptions, type)
    );

    act(() => {
      result.current.handleFilterChange('status_id', 2);
    });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      status_id: 2
    });
  });

  it('should get applied filters correctly', () => {
    const { result } = renderHook(() =>
      useFilterPanel(initialFilters, mockOnFilterChange, mockOptions, type)
    );

    const appliedFilters = result.current.getAppliedFilters(mockOptions);

    expect(appliedFilters).toHaveLength(3);
    expect(appliedFilters.map((f) => ({ field: f.field, displayLabel: f.displayLabel, displayValue: f.displayValue }))).toEqual([
      { field: 'search', displayLabel: 'Search', displayValue: 'test' },
      { field: 'status_id', displayLabel: 'Status', displayValue: 'Active' },
      { field: 'priority_id', displayLabel: 'Priority', displayValue: 'Low' }
    ]);
    appliedFilters.forEach((f) => {
      expect((f as { id?: string }).id).toBeDefined();
    });
  });

  it('should rehydrate single dropdown value with valueMulti so dropdown shows selection', () => {
    const { result } = renderHook(() =>
      useFilterPanel({ priority_id: 2 }, mockOnFilterChange, mockOptions, type)
    );

    expect(result.current.activeFilters).toHaveLength(1);
    expect(result.current.activeFilters[0].field).toBe('priority_id');
    expect(result.current.activeFilters[0].operator).toBe('includes');
    expect(result.current.activeFilters[0].valueMulti).toEqual([2]);
  });

  it('should handle display value for non-existing option', () => {
    const { result } = renderHook(() =>
      useFilterPanel({ status_id: 999 }, mockOnFilterChange, mockOptions, type)
    );

    const appliedFilters = result.current.getAppliedFilters(mockOptions);
    expect(appliedFilters[0].displayValue).toBe('999');
  });

  it('should clear staged filters without applying until user clicks Apply', () => {
    const { result } = renderHook(() =>
      useFilterPanel(initialFilters, mockOnFilterChange, mockOptions, type)
    );

    act(() => {
      result.current.handleClearFilters();
    });

    expect(result.current.activeFilters).toHaveLength(0);
    expect(mockOnFilterChange).not.toHaveBeenCalled();
  });

  it('should toggle expanded state', () => {
    const { result } = renderHook(() =>
      useFilterPanel(initialFilters, mockOnFilterChange, mockOptions, type)
    );

    act(() => {
      result.current.setExpanded(true);
    });

    expect(result.current.expanded).toBe(true);

    act(() => {
      result.current.setExpanded(false);
    });

    expect(result.current.expanded).toBe(false);
  });

  it('should handle null/undefined/empty filter values', () => {
    const filtersWithEmpty: FilterValues = {
      search: '',
      status_id: null as unknown as number,
      priority_id: undefined
    };

    const { result } = renderHook(() =>
      useFilterPanel(filtersWithEmpty, mockOnFilterChange, mockOptions, type)
    );

    const appliedFilters = result.current.getAppliedFilters(mockOptions);
    expect(appliedFilters).toEqual([]);
  });

  it('should add filter and update filter; applyFilters sends to parent', () => {
    const { result } = renderHook(() => {
      const [filters, setFilters] = React.useState<FilterValues>({});
      return useFilterPanel(filters, (next) => { setFilters(next); mockOnFilterChange(next); }, mockOptions, type);
    });

    act(() => {
      result.current.addFilter({
        key: 'status_id',
        label: 'Status',
        kind: 'dropdown',
        optionKey: 'statuses'
      });
    });

    expect(result.current.activeFilters).toHaveLength(1);
    expect(result.current.activeFilters[0].field).toBe('status_id');
    expect(result.current.activeFilters[0].operator).toBe('is');

    act(() => {
      result.current.updateFilter(result.current.activeFilters[0].id, { value: 1 });
    });

    expect(mockOnFilterChange).not.toHaveBeenCalled();

    act(() => {
      result.current.applyFilters();
    });

    expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({ status_id: 1 }));
  });

  it('should remove filter from staged state without applying', () => {
    const { result } = renderHook(() => {
      const [filters, setFilters] = React.useState<FilterValues>({ status_id: 1 });
      return useFilterPanel(filters, (next) => { setFilters(next); mockOnFilterChange(next); }, mockOptions, type);
    });

    const initialCount = result.current.activeFilters.length;
    expect(initialCount).toBeGreaterThan(0);
    const idToRemove = result.current.activeFilters[0].id;

    act(() => {
      result.current.removeFilter(idToRemove);
    });

    expect(result.current.activeFilters).toHaveLength(0);
    expect(mockOnFilterChange).not.toHaveBeenCalled();
  });
});
