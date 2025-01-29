import { renderHook, act } from '@testing-library/react-hooks';
import { useLogin } from '../useLogin';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('useLogin', () => {
  const mockNavigate = jest.fn();
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mocks
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
  });

  it('should initialize with empty login details and no error', () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.loginDetails).toEqual({
      login: '',
      password: ''
    });
    expect(result.current.error).toBe('');
  });

  it('should update login details when handleInputChange is called', () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'login', value: 'testuser' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.loginDetails.login).toBe('testuser');
  });

  it('should call login and navigate on successful submit', async () => {
    const { result } = renderHook(() => useLogin());

    // Set login details
    act(() => {
      result.current.handleInputChange({
        target: { name: 'login', value: 'testuser' }
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleInputChange({
        target: { name: 'password', value: 'password123' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // Mock successful login
    mockLogin.mockResolvedValueOnce(undefined);

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: () => {}
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(result.current.error).toBe('');
  });

  it('should set error message on login failure', async () => {
    const { result } = renderHook(() => useLogin());

    // Mock failed login
    mockLogin.mockRejectedValueOnce(new Error('Login failed'));

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: () => {}
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Login error. Please try again.');
  });

  it('should prevent default form submission', async () => {
    const { result } = renderHook(() => useLogin());
    const preventDefault = jest.fn();

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(preventDefault).toHaveBeenCalled();
  });
});