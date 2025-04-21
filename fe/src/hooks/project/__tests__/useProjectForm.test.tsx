import { renderHook, act } from '@testing-library/react';
import { useProjectForm } from '../useProjectForm';
import dayjs from 'dayjs';
import { SelectChangeEvent } from '@mui/material';
import { Project } from '../../../types/project'

describe('useProjectForm', () => {
  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    description: 'Test Description',
    status_id: 1,
    status_name: 'Active',
    start_date: '2024-01-01',
    due_date: '2024-12-31',
    created_by: 1,
    created_by_name: 'Test User',
    created_on: '2024-01-01',
    estimated_time: 100,
    spent_time: 50,
    progress: 50,
    parent_id: null,
    parent_name: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values when no project is provided', () => {
    const { result } = renderHook(() => useProjectForm());
    const today = new Date().toISOString().split('T')[0];

    expect(result.current.formData).toEqual({
      name: '',
      description: null,
      start_date: today,
      due_date: '',
      status_id: 1,
      parent_id: null
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.dateError).toBe('');
  });

  it('should initialize with project values when project is provided', () => {
    const { result } = renderHook(() => useProjectForm(mockProject));

    expect(result.current.formData).toEqual({
      name: mockProject.name,
      description: mockProject.description,
      start_date: mockProject.start_date,
      due_date: mockProject.due_date,
      status_id: mockProject.status_id,
      parent_id: mockProject.parent_id
    });
  });

  it('should initialize with parent ID when provided', () => {
    const parentId = '2';
    const { result } = renderHook(() => useProjectForm(undefined, parentId));

    expect(result.current.formData.parent_id).toBe(2);
  });

  it('should handle text field changes', () => {
    const { result } = renderHook(() => useProjectForm());

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'New Project Name' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.name).toBe('New Project Name');
    expect(result.current.errors.name).toBe(undefined);
  });

  it('should handle status changes', () => {
    const { result } = renderHook(() => useProjectForm());

    act(() => {
      result.current.handleStatusChange({
        target: { value: 2 }
      } as SelectChangeEvent<number>);
    });

    expect(result.current.formData.status_id).toBe(2);
  });

  it('should handle date changes with valid dates', () => {
    const { result } = renderHook(() => useProjectForm());

    act(() => {
      result.current.handleDateChange('start_date', dayjs('2024-01-01'));
    });

    expect(result.current.formData.start_date).toBe('2024-01-01');
    expect(result.current.dateError).toBe('');

    act(() => {
      result.current.handleDateChange('due_date', dayjs('2024-12-31'));
    });

    expect(result.current.formData.due_date).toBe('2024-12-31');
    expect(result.current.dateError).toBe('');
  });

  it('should handle null date values', () => {
    const { result } = renderHook(() => useProjectForm());

    act(() => {
      result.current.handleDateChange('start_date', null);
    });

    expect(result.current.formData.start_date).toBe('');
  });

  it('should validate date ranges', () => {
    const { result } = renderHook(() => useProjectForm());

    // Set valid start date
    act(() => {
      result.current.handleDateChange('start_date', dayjs('2024-01-01'));
    });

    // Set due date before start date
    act(() => {
      result.current.handleDateChange('due_date', dayjs('2023-12-31'));
    });

    expect(result.current.dateError).toBe('Due date must be after start date');
  });

  it('should handle parent ID changes', () => {
    const { result } = renderHook(() => useProjectForm());

    act(() => {
      result.current.handleParentChange({
        target: { value: '2' }
      } as SelectChangeEvent<string | number>);
    });

    expect(result.current.formData.parent_id).toBe(2);

    // Test setting to null
    act(() => {
      result.current.handleParentChange({
        target: { value: '' }
      } as SelectChangeEvent<string | number>);
    });

    expect(result.current.formData.parent_id).toBeNull();
  });

  it('should validate form data', () => {
    const { result } = renderHook(() => useProjectForm());

    let isValid = false;

    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.name).toBe('Project name is required');

    // Fill in required fields
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'Test Project' }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.handleDateChange('start_date', dayjs('2024-01-01'));
    });
    act(() => {
      result.current.handleDateChange('due_date', dayjs('2024-12-31'));
    });

    act(() => {
      isValid = result.current.validateForm();
    });
    console.log(result.current.formData);
    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });
});
