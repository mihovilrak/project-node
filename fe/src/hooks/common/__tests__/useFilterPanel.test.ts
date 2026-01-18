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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useFilterPanel(initialFilters, mockOnFilterChange)
    );

    expect(result.current.expanded).toBe(false);
  });

  it('should handle filter changes correctly', () => {
    const { result } = renderHook(() =>
      useFilterPanel(initialFilters, mockOnFilterChange)
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
      useFilterPanel(initialFilters, mockOnFilterChange)
    );

    const appliedFilters = result.current.getAppliedFilters(mockOptions);

    expect(appliedFilters).toEqual([
      { field: 'search', value: 'test', displayValue: 'test' },
      { field: 'status_id', value: 1, displayValue: 'Active' },
      { field: 'priority_id', value: 2, displayValue: 'Low' }
    ]);
  });

  it('should handle display value for non-existing option', () => {
    const { result } = renderHook(() =>
      useFilterPanel({ status_id: 999 }, mockOnFilterChange)
    );

    const appliedFilters = result.current.getAppliedFilters(mockOptions);
    expect(appliedFilters[0].displayValue).toBe('999');
  });

  it('should clear filters correctly', () => {
    const { result } = renderHook(() =>
      useFilterPanel(initialFilters, mockOnFilterChange)
    );

    act(() => {
      result.current.handleClearFilters();
    });

    expect(mockOnFilterChange).toHaveBeenCalledWith({});
    expect(result.current.expanded).toBe(false);
  });

  it('should toggle expanded state', () => {
    const { result } = renderHook(() =>
      useFilterPanel(initialFilters, mockOnFilterChange)
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
      useFilterPanel(filtersWithEmpty, mockOnFilterChange)
    );

    const appliedFilters = result.current.getAppliedFilters(mockOptions);
    expect(appliedFilters).toEqual([]);
  });
});