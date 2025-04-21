import { renderHook, act } from '@testing-library/react';
import { SelectChangeEvent } from '@mui/material';
import { useUserDialog } from '../useUserDialog';
import { createUser, updateUser } from '../../../api/users';
import { User } from '../../../types/user';

// Mock the API calls
jest.mock('../../../api/users');

describe('useUserDialog', () => {
  const mockUser: User = {
    id: 1,
    login: 'testuser',
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    role_id: 2,
    status_id: 1,
    avatar_url: null,
    last_login: null,
    created_on: '2024-01-25T00:00:00Z',
    updated_on: null
  };

  const mockOnClose = jest.fn();
  const mockOnUserSaved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values when no user is provided', () => {
    const { result } = renderHook(() => 
      useUserDialog(null, true, mockOnClose, mockOnUserSaved)
    );

    expect(result.current.formData).toEqual({
      login: '',
      name: '',
      surname: '',
      email: '',
      password: '',
      role_id: 3,
      status_id: 1
    });
    expect(result.current.error).toBeNull();
  });

  it('should initialize with user data when provided', () => {
    const { result } = renderHook(() => 
      useUserDialog(mockUser, true, mockOnClose, mockOnUserSaved)
    );

    expect(result.current.formData).toEqual({
      login: mockUser.login,
      name: mockUser.name,
      surname: mockUser.surname,
      email: mockUser.email,
      password: '',
      role_id: mockUser.role_id,
      status_id: mockUser.status_id
    });
  });

  it('should handle text input changes', () => {
    const { result } = renderHook(() => 
      useUserDialog(null, true, mockOnClose, mockOnUserSaved)
    );

    act(() => {
      const mockEvent = {
        target: { name: 'name', value: 'New Name' }
      } as React.ChangeEvent<HTMLInputElement>;
      
      result.current.handleTextChange(mockEvent);
    });

    expect(result.current.formData.name).toBe('New Name');
  });

  it('should handle role selection changes', () => {
    const { result } = renderHook(() => 
      useUserDialog(null, true, mockOnClose, mockOnUserSaved)
    );

    act(() => {
      const mockEvent = {
        target: { value: 2 }
      } as SelectChangeEvent<number>;
      
      result.current.handleRoleChange(mockEvent);
    });

    expect(result.current.formData.role_id).toBe(2);
  });

  it('should create new user successfully', async () => {
    const newUser = {
      login: 'newuser',
      name: 'New',
      surname: 'User',
      email: 'new@example.com',
      password: 'password123',
      role_id: 3,
      status_id: 1
    };

    (createUser as jest.Mock).mockResolvedValueOnce({ ...newUser, id: 2 });

    const { result } = renderHook(() => 
      useUserDialog(null, true, mockOnClose, mockOnUserSaved)
    );

    // Set form data
    act(() => {
      Object.entries(newUser).forEach(([key, value]) => {
        const mockEvent = {
          target: { name: key, value }
        } as React.ChangeEvent<HTMLInputElement>;
        result.current.handleTextChange(mockEvent);
      });
    });

    // Submit form
    await act(async () => {
      const mockEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;
      
      await result.current.handleSubmit(mockEvent);
    });

    expect(createUser).toHaveBeenCalledWith(newUser);
    expect(mockOnUserSaved).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('should update existing user successfully', async () => {
    (updateUser as jest.Mock).mockResolvedValueOnce({ ...mockUser, name: 'Updated Name' });

    const { result } = renderHook(() => 
      useUserDialog(mockUser, true, mockOnClose, mockOnUserSaved)
    );

    // Update name
    act(() => {
      const mockEvent = {
        target: { name: 'name', value: 'Updated Name' }
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleTextChange(mockEvent);
    });

    // Submit form
    await act(async () => {
      const mockEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;
      
      await result.current.handleSubmit(mockEvent);
    });

    expect(updateUser).toHaveBeenCalledWith(mockUser.id, {
      id: mockUser.id,
      name: 'Updated Name'
    });
    expect(mockOnUserSaved).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('should handle submission error', async () => {
    const error = new Error('Failed to save user');
    (createUser as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => 
      useUserDialog(null, true, mockOnClose, mockOnUserSaved)
    );

    await act(async () => {
      const mockEvent = {
        preventDefault: jest.fn()
      } as unknown as React.FormEvent<HTMLFormElement>;
      
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.error).toBe('Failed to save user');
    expect(mockOnUserSaved).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should reset form when dialog is reopened', () => {
    const { result, rerender } = renderHook(
      ({ user, open }) => useUserDialog(user, open, mockOnClose, mockOnUserSaved),
      { initialProps: { user: mockUser, open: true } }
    );

    // Initial state with user
    expect(result.current.formData.name).toBe(mockUser.name);

    // Close dialog
    rerender({ user: mockUser, open: false });
    
    expect(result.current.formData).toEqual({
      login: '',
      name: '',
      surname: '',
      email: '',
      password: '',
      role_id: 3,
      status_id: 1
    });
  });
});
