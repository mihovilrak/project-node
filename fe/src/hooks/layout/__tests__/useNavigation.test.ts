import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '../useNavigation';
import { useNavigate } from 'react-router-dom';

// Mock react-router-dom's useNavigate hook
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

describe('useNavigation', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('should initialize with activeTab as 0', () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(0);
  });

  it.each([
    [0, '/'],
    [1, '/projects'],
    [2, '/users'],
    [3, '/tasks'],
    [4, '/settings'],
    [5, '/profile']
  ])('should navigate to correct route when tab %i is selected', (tabIndex, expectedRoute) => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.handleTabChange({} as React.SyntheticEvent, tabIndex);
    });

    expect(result.current.activeTab).toBe(tabIndex);
    expect(mockNavigate).toHaveBeenCalledWith(expectedRoute);
  });

  it('should not navigate when invalid tab index is provided', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.handleTabChange({} as React.SyntheticEvent, 999);
    });

    expect(result.current.activeTab).toBe(999);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
