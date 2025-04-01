import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
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
    const expandButton = screen.getByTestId('ExpandMoreIcon').parentElement;
    fireEvent.click(expandButton!);
    expect(screen.getByText('Apply Filters')).toBeVisible();
  });

  it('renders filter chips for applied filters', () => {
    const filters: FilterValues = {
      status_id: '1'
    };
    setup({ ...defaultProps, filters });
    expect(screen.getByText('status_id: Active')).toBeInTheDocument();
  });

  it('calls onFilterChange when clearing filters', () => {
    const filters: FilterValues = {
      status_id: '1'
    };
    setup({ ...defaultProps, filters });
    
    const expandButton = screen.getByTestId('ExpandMoreIcon').parentElement;
    fireEvent.click(expandButton!);
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({});
  });

  it('updates filter when selecting a value', async () => {
    setup();
    
    const expandButton = screen.getByTestId('ExpandMoreIcon').parentElement;
    fireEvent.click(expandButton!);
    
    // Open select dropdown
    const select = screen.getByRole('combobox', { name: /statuses/i });
    fireEvent.mouseDown(select);
    
    // Find and click the Active option
    const option = await screen.findByRole('option', { name: /Active/i });
    fireEvent.click(option);
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ status_id: '1' })
    );
  });

  it('collapses panel when clicking Apply Filters', () => {
    setup();
    
    const expandButton = screen.getByTestId('ExpandMoreIcon').parentElement;
    fireEvent.click(expandButton!);
    
    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);
    
    expect(applyButton).not.toBeVisible();
  });
});