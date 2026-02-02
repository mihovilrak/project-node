import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FilterPanel from '../FilterPanel';
import { FilterPanelProps, FilterValues } from '../../../types/filterPanel';

describe('FilterPanel', () => {
  const mockOptions = {
    statuses: [
      { id: 1, name: 'Active' },
      { id: 2, name: 'Completed' }
    ],
    priorities: [
      { id: 1, name: 'High' },
      { id: 2, name: 'Low' }
    ],
    search: true
  };

  const defaultProps: FilterPanelProps = {
    type: 'tasks',
    filters: {},
    options: mockOptions,
    onFilterChange: jest.fn()
  };

  const setup = (props = defaultProps) => {
    return render(<FilterPanel {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders in collapsed state initially', () => {
    setup();
    expect(screen.queryByText('Apply Filters')).not.toBeVisible();
  });

  it('expands when clicking expand button', () => {
    setup();
    const expandButton = screen.getByRole('button', { name: /expand filters/i });
    fireEvent.click(expandButton);
    expect(screen.getByText('Apply Filters')).toBeVisible();
  });

  it('renders filter chips for applied filters', () => {
    const filters: FilterValues = {
      status_id: 1
    };
    setup({ ...defaultProps, filters });
    expect(screen.getByText(/Status: Active/)).toBeInTheDocument();
  });

  it('calls onFilterChange when clearing filters', () => {
    const filters: FilterValues = {
      status_id: 1
    };
    setup({ ...defaultProps, filters });

    const expandButton = screen.getByRole('button', { name: /expand filters/i });
    fireEvent.click(expandButton);

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({});
  });

  it('adds filter and updates value when selecting from Add filter list and value dropdown', async () => {
    setup();

    const expandButton = screen.getByRole('button', { name: /expand filters/i });
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText('Add filter')).toBeInTheDocument();
    });

    const statusFilterItem = screen.getByTestId('add-filter-status_id');
    fireEvent.click(statusFilterItem);

    await waitFor(() => {
      expect(screen.getByLabelText(/Value/i)).toBeInTheDocument();
    });

    const valueSelect = screen.getByLabelText(/Value/i);
    fireEvent.mouseDown(valueSelect);

    const activeOption = await screen.findByRole('option', { name: /Active/i });
    fireEvent.click(activeOption);

    await waitFor(() => {
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ status_id: 1 })
      );
    });
  });

  it('collapses panel when clicking Apply Filters', async () => {
    setup();

    const expandButton = screen.getByRole('button', { name: /expand filters/i });
    fireEvent.click(expandButton);

    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(applyButton).not.toBeVisible();
    });
  });
});
