import { renderHook, act } from '@testing-library/react-hooks';
import { useActivityTypeDialog } from '../useActivityTypeDialog';
import { ActivityType } from '../../../types/setting';

describe('useActivityTypeDialog', () => {
  const mockActivityType: ActivityType = {
    id: 1,
    name: 'Test Activity',
    color: '#FF0000',
    description: 'Test Description',
    active: true,
    icon: 'test-icon'
  };

  it('should initialize with default values when no activity type is provided', () => {
    const { result } = renderHook(() => useActivityTypeDialog(undefined));

    expect(result.current.formData).toEqual({
      name: '',
      color: '#2196f3',
      description: '',
      active: true,
      icon: undefined
    });
    expect(result.current.error).toBeUndefined();
  });

  it('should initialize with activity type data when provided', () => {
    const { result } = renderHook(() => useActivityTypeDialog(mockActivityType));

    expect(result.current.formData).toEqual({
      name: mockActivityType.name,
      color: mockActivityType.color,
      description: mockActivityType.description,
      active: mockActivityType.active,
      icon: mockActivityType.icon
    });
  });

  it('should handle form field changes', () => {
    const { result } = renderHook(() => useActivityTypeDialog(undefined));

    act(() => {
      result.current.handleChange('name', 'New Activity');
    });
    expect(result.current.formData.name).toBe('New Activity');

    act(() => {
      result.current.handleChange('color', '#00FF00');
    });
    expect(result.current.formData.color).toBe('#00FF00');

    act(() => {
      result.current.handleChange('active', false);
    });
    expect(result.current.formData.active).toBe(false);
  });

  it('should handle error state', () => {
    const { result } = renderHook(() => useActivityTypeDialog(undefined));

    act(() => {
      result.current.setError('Test error');
    });
    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeUndefined();
  });

  it('should update form data when activity type prop changes', () => {
    const { result, rerender } = renderHook(
      (props) => useActivityTypeDialog(props),
      { initialProps: undefined as ActivityType | undefined }
    );

    // Initial state
    expect(result.current.formData.name).toBe('');

    // Update with activity type
    rerender(mockActivityType);
    expect(result.current.formData).toEqual({
      name: mockActivityType.name,
      color: mockActivityType.color,
      description: mockActivityType.description,
      active: mockActivityType.active,
      icon: mockActivityType.icon
    });

    // Update with different activity type
    const newActivityType = {
      ...mockActivityType,
      name: 'New Activity',
      color: '#00FF00'
    };
    rerender(newActivityType);
    expect(result.current.formData.name).toBe('New Activity');
    expect(result.current.formData.color).toBe('#00FF00');

    // Update back to undefined
    rerender(undefined);
    expect(result.current.formData).toEqual({
      name: '',
      color: '#2196f3',
      description: '',
      active: true,
      icon: undefined
    });
  });
});
