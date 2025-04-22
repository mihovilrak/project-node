import { renderHook, act, waitFor } from '@testing-library/react';
import { useIconSelector } from '../useIconSelector';
import { getActivityTypes } from '../../../api/activityTypes';
import { ActivityType } from '../../../types/setting';

// Mock the API calls
jest.mock('../../../api/activityTypes');

describe('useIconSelector', () => {
  const mockActivityTypes: ActivityType[] = [
    { id: 1, name: 'Activity 1', icon: 'icon1', color: '#000000', active: true },
    { id: 2, name: 'Activity 2', icon: 'icon2', color: '#ffffff', active: false },
    { id: 3, name: 'Activity 3', icon: undefined, color: '#000000', active: true },
    { id: 4, name: 'Activity 4', icon: 'icon4', color: '#ffffff', active: false }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getActivityTypes as jest.Mock).mockResolvedValue(mockActivityTypes);
  });

  it('should initialize with the provided initial value', () => {
    const { result } = renderHook(() => useIconSelector('initial-icon'));

    expect(result.current.value).toBe('initial-icon');
    expect(result.current.open).toBe(false);
  });

  it('should load and filter icons on mount', async () => {
    const { result } = renderHook(() => useIconSelector(undefined));

    await waitFor(() => {
      expect(getActivityTypes).toHaveBeenCalledTimes(1);
      expect(result.current.icons).toEqual(['icon1', 'icon2', 'icon4']);
    });
  });

  it('should handle API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (getActivityTypes as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useIconSelector(undefined));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load icons:', expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });

  it('should handle dialog open state', () => {
    const { result } = renderHook(() => useIconSelector(undefined));

    act(() => {
      result.current.handleOpen();
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.handleClose();
    });
    expect(result.current.open).toBe(false);
  });

  it('should handle icon selection', () => {
    const { result } = renderHook(() => useIconSelector(undefined));

    act(() => {
      result.current.handleOpen();
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.handleSelect('new-icon');
    });
    expect(result.current.value).toBe('new-icon');
    expect(result.current.open).toBe(false);
  });

  it('should maintain selected value between renders', () => {
    const { result, rerender } = renderHook(() => useIconSelector('test-icon'));

    expect(result.current.value).toBe('test-icon');

    act(() => {
      result.current.handleSelect('new-icon');
    });
    expect(result.current.value).toBe('new-icon');

    rerender();
    expect(result.current.value).toBe('new-icon');
  });
});
