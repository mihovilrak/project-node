import { renderHook, act } from '@testing-library/react';
import { useProjectEdit } from '../useProjectEdit';
import { getProjectStatuses } from '../../../api/projects';
import { SelectChangeEvent } from '@mui/material';

// Mock dependencies
jest.mock('../../../api/projects');

describe('useProjectEdit', () => {
  const mockProject = {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    status_id: 1,
    status_name: 'Active',
    start_date: '2024-01-01T00:00:00Z',
    due_date: '2024-12-31T00:00:00Z',
    created_by: 1,
    created_by_name: 'Test User',
    created_on: '2024-01-01',
    estimated_time: 100,
    spent_time: 50,
    progress: 50,
    parent_id: null,
    parent_name: null
  };

  const mockStatuses = [
    { id: 1, name: 'Active' },
    { id: 2, name: 'Completed' },
    { id: 3, name: 'On Hold' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getProjectStatuses as jest.Mock).mockResolvedValue(mockStatuses);
  });

  it('should initialize with empty form data when no project is provided', () => {
    const { result } = renderHook(() => useProjectEdit(null));

    expect(result.current.formData).toEqual({
      name: '',
      description: null,
      start_date: '',
      due_date: '',
      status_id: 1
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load project data when project is provided', () => {
    const { result } = renderHook(() => useProjectEdit(mockProject));

    expect(result.current.formData).toEqual({
      name: mockProject.name,
      description: mockProject.description,
      start_date: '2024-01-01',
      due_date: '2024-12-31',
      status_id: mockProject.status_id
    });
  });

  it('should fetch project statuses on mount', async () => {
    const { result } = renderHook(() => useProjectEdit(null));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(getProjectStatuses).toHaveBeenCalled();
    expect(result.current.statuses).toEqual(mockStatuses);
  });

  it('should handle text field changes', () => {
    const { result } = renderHook(() => useProjectEdit(null));

    act(() => {
      result.current.handleTextChange('name')({
        target: { value: 'New Project Name' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.name).toBe('New Project Name');
  });

  it('should handle date field changes', () => {
    const { result } = renderHook(() => useProjectEdit(null));

    // Set start date
    act(() => {
      result.current.handleTextChange('start_date')({
        target: { value: '2024-01-01' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.start_date).toBe('2024-01-01');

    // Set due date
    act(() => {
      result.current.handleTextChange('due_date')({
        target: { value: '2024-12-31' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.due_date).toBe('2024-12-31');
  });

  it('should prevent setting due date before start date', () => {
    const { result } = renderHook(() => useProjectEdit(null));

    // Set start date
    act(() => {
      result.current.handleTextChange('start_date')({
        target: { value: '2024-12-31' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // Try to set due date before start date
    act(() => {
      result.current.handleTextChange('due_date')({
        target: { value: '2024-01-01' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // Due date should not be updated
    expect(result.current.formData.due_date).toBe('');
  });

  it('should handle status changes', () => {
    const { result } = renderHook(() => useProjectEdit(null));

    act(() => {
      result.current.handleStatusChange({
        target: { value: 2 }
      } as SelectChangeEvent<number>);
    });

    expect(result.current.formData.status_id).toBe(2);
  });

  it('should handle error during status fetch', async () => {
    const error = new Error('Failed to fetch statuses');
    (getProjectStatuses as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useProjectEdit(null));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Failed to load project statuses');
  });
});
