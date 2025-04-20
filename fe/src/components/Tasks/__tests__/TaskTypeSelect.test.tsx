import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SelectChangeEvent } from '@mui/material';
import TaskTypeSelect from '../TaskTypeSelect';
import { getTaskTypes } from '../../../api/taskTypes';
import { TaskType } from '../../../types/task';

// Mock the API module
jest.mock('../../../api/taskTypes');

// Mock data based on SQL fixtures
const mockTaskTypes: TaskType[] = [
  {
    id: 1,
    name: 'Task',
    color: '#2196f3',
    icon: 'TaskAlt'
  },
  {
    id: 2,
    name: 'Bug',
    color: '#f44336',
    icon: 'BugReport'
  }
];

describe('TaskTypeSelect', () => {
  const mockOnChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (getTaskTypes as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(
      <TaskTypeSelect
        value={1}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders task types after loading', async () => {
    (getTaskTypes as jest.Mock).mockResolvedValue(mockTaskTypes);

    render(
      <TaskTypeSelect
        value={1}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Only the selected value is rendered by default
    expect(screen.getByText('Task')).toBeInTheDocument();
    // Open the dropdown to render all options
    const combobox = screen.getByRole('combobox', { name: /task type/i });
    fireEvent.mouseDown(combobox);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Task' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Bug' })).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (getTaskTypes as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TaskTypeSelect
        value={1}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to fetch task types:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('calls onChange when a type is selected', async () => {
    (getTaskTypes as jest.Mock).mockResolvedValue(mockTaskTypes);

    render(
      <TaskTypeSelect
        value={1}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox', { name: /task type/i });
    fireEvent.mouseDown(combobox);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Bug' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('option', { name: 'Bug' }));

    expect(mockOnChange).toHaveBeenCalled();
    const changeEvent = mockOnChange.mock.calls[0][0] as SelectChangeEvent<number>;
    expect(changeEvent.target.value).toBeTruthy();
  });

  it('displays required indicator when required prop is true', async () => {
    (getTaskTypes as jest.Mock).mockResolvedValue(mockTaskTypes);

    render(
      <TaskTypeSelect
        value={1}
        onChange={mockOnChange}
        required={true}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Task Type')).toHaveClass('Mui-required');
  });

  it('shows error state when error prop is true', async () => {
    (getTaskTypes as jest.Mock).mockResolvedValue(mockTaskTypes);

    render(
      <TaskTypeSelect
        value={1}
        onChange={mockOnChange}
        error={true}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox', { name: /task type/i });
    expect(combobox).toHaveClass('Mui-error');
  });

  it('renders icons for task types that have them', async () => {
    (getTaskTypes as jest.Mock).mockResolvedValue(mockTaskTypes);

    render(
      <TaskTypeSelect
        value={1}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const combobox = screen.getByRole('combobox', { name: /task type/i });
    fireEvent.mouseDown(combobox);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Task' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Bug' })).toBeInTheDocument();
    });
    const menuItems = screen.getAllByRole('option');
    expect(menuItems[0]).toContainHTML('TaskAlt');
    expect(menuItems[1]).toContainHTML('BugReport');
  });
});