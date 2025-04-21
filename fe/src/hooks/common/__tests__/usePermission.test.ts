import { renderHook } from '@testing-library/react';
import { usePermission } from '../usePermission';
import { useAuth } from '../../../context/AuthContext';

// Mock the useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('usePermission', () => {
  // Cast useAuth as jest.Mock for TypeScript
  const mockUseAuth = useAuth as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return hasPermission true when user has permission', () => {
    mockUseAuth.mockReturnValue({
      hasPermission: (perm: string) => perm === 'test.permission',
      permissionsLoading: false
    });

    const { result } = renderHook(() => usePermission('test.permission'));

    expect(result.current.hasPermission).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('should return hasPermission false when user does not have permission', () => {
    mockUseAuth.mockReturnValue({
      hasPermission: () => false,
      permissionsLoading: false
    });

    const { result } = renderHook(() => usePermission('test.permission'));

    expect(result.current.hasPermission).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('should return loading state correctly', () => {
    mockUseAuth.mockReturnValue({
      hasPermission: () => false,
      permissionsLoading: true
    });

    const { result } = renderHook(() => usePermission('test.permission'));

    expect(result.current.loading).toBe(true);
  });

  it('should update hasPermission when checkPermission result changes', () => {
    const mockHasPermission = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    mockUseAuth.mockReturnValue({
      hasPermission: mockHasPermission,
      permissionsLoading: false
    });

    const { result, rerender } = renderHook(
      ({ permission }) => usePermission(permission),
      { initialProps: { permission: 'test.permission' } }
    );

    expect(result.current.hasPermission).toBe(false);

    rerender({ permission: 'test.permission.new' });
    expect(result.current.hasPermission).toBe(true);
  });

  it('should handle empty permission string', () => {
    mockUseAuth.mockReturnValue({
      hasPermission: () => false,
      permissionsLoading: false
    });

    const { result } = renderHook(() => usePermission(''));

    expect(result.current.hasPermission).toBe(false);
    expect(result.current.loading).toBe(false);
  });
});