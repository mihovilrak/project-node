import { renderHook } from '@testing-library/react-hooks';
import { useHeader } from '../useHeader';
import { useAuth } from '../../../context/AuthContext';
import { User } from '../../../types/user';

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('useHeader', () => {
  // Mock user for testing
  const mockUser: User = {
    id: 1,
    name: 'Test User',
    login: 'testuser',
    surname: 'Test',
    email: 'test@example.com',
    role_id: 1,
    status_id: 1,
    avatar_url: null,
    created_on: '2025-01-25T16:29:14.000Z',
    updated_on: '2025-01-25T16:29:14.000Z',
    last_login: '2025-01-25T16:29:14.000Z',
  };

  // Setup mock implementation of useAuth
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: mockUser
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useHeader());

    expect(result.current.isScrolled).toBe(false);
    expect(result.current.currentUser).toBe(mockUser);
  });

  it('should update isScrolled when window is scrolled', () => {
    const { result } = renderHook(() => useHeader());
    
    // Simulate scroll event
    global.window.scrollY = 100;
    global.dispatchEvent(new Event('scroll'));

    expect(result.current.isScrolled).toBe(true);

    // Reset scroll position
    global.window.scrollY = 0;
    global.dispatchEvent(new Event('scroll'));

    expect(result.current.isScrolled).toBe(false);
  });

  it('should handle case when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: null
    });

    const { result } = renderHook(() => useHeader());

    expect(result.current.currentUser).toBeNull();
    expect(result.current.isScrolled).toBe(false);
  });

  it('should cleanup scroll event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useHeader());
    
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });

  it('should add scroll event listener on mount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    
    renderHook(() => useHeader());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });
});