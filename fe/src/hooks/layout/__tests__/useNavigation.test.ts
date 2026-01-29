import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '../useNavigation';
import { useNavigate, useLocation } from 'react-router-dom';

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn()
}));

describe('useNavigation', () => {
  const mockNavigate = jest.fn();
  const mockLocation = { pathname: '/' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useLocation as jest.Mock).mockReturnValue(mockLocation);
  });

  it('should initialize with activeTab as 0 for home route', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(0);
  });

  it('should sync activeTab with projects routes', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/projects' });
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(1);
  });

  it('should sync activeTab with project details route', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/projects/123' });
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(1);
  });

  it('should sync activeTab with new project route', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/projects/new' });
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(1);
  });

  it('should sync activeTab with users routes', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/users' });
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(2);
  });

  it('should sync activeTab with user details route', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/users/123' });
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(2);
  });

  it('should sync activeTab with tasks routes', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/tasks' });
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(3);
  });

  it('should sync activeTab with task details route', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/tasks/123' });
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(3);
  });

  it('should sync activeTab with new task route', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/tasks/new' });
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(3);
  });

  it('should sync activeTab with task edit route', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/tasks/123/edit' });
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(3);
  });

  it('should sync activeTab with settings route', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/settings' });
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(4);
  });

  it.each([
    [0, '/'],
    [1, '/projects'],
    [2, '/users'],
    [3, '/tasks'],
    [4, '/settings'],
    [5, '/profile']
  ])('should navigate to correct route when tab %i is selected', (tabIndex, expectedRoute) => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.handleTabChange({} as React.SyntheticEvent, tabIndex);
    });

    expect(result.current.activeTab).toBe(tabIndex);
    expect(mockNavigate).toHaveBeenCalledWith(expectedRoute);
  });

  it('should not navigate when invalid tab index is provided', () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.handleTabChange({} as React.SyntheticEvent, 999);
    });

    expect(result.current.activeTab).toBe(999);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
