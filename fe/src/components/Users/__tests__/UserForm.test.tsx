import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import UserForm from '../UserForm';
import { useUserForm } from '../../../hooks/user/useUserForm';
import { FormData } from '../../../types/user';
import { Role } from '../../../types/role';

// Mock the custom hook
jest.mock('../../../hooks/user/useUserForm');
const mockedUseUserForm = useUserForm as jest.MockedFunction<typeof useUserForm>;

const mockRoles: Role[] = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'User' }
];

const defaultMockFormValues: FormData = {
  login: '',
  name: '',
  surname: '',
  email: '',
  password: '',
  currentPassword: '',
  confirmPassword: '',
  role_id: 1,
};

const mockHandleSubmit = jest.fn().mockImplementation(
  async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    return Promise.resolve();
  }
);

describe('UserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseUserForm.mockReturnValue({
      loading: false,
      error: null,
      roles: mockRoles,
      formValues: defaultMockFormValues,
      handleInputChange: jest.fn((e: React.ChangeEvent<HTMLInputElement>) => {}),
      handleSubmit: mockHandleSubmit,
    });
  });

  const renderComponent = (path: string = '/users/new') => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/users/:id/edit" element={<UserForm />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders new user form correctly', () => {
    renderComponent();
    expect(screen.getByText('Add New User')).toBeInTheDocument();
    expect(screen.getByLabelText(/login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders edit user form correctly', () => {
    mockedUseUserForm.mockReturnValue({
      loading: false,
      error: null,
      roles: mockRoles,
      formValues: { ...defaultMockFormValues, name: 'John', surname: 'Doe' },
      handleInputChange: jest.fn(),
      handleSubmit: mockHandleSubmit,
    });

    renderComponent('/users/1/edit');
    expect(screen.getByText('Edit User John Doe')).toBeInTheDocument();
  });

  test('displays error message when present', () => {
    const errorMessage = 'Test error message';
    mockedUseUserForm.mockReturnValue({
      loading: false,
      error: errorMessage,
      roles: mockRoles,
      formValues: defaultMockFormValues,
      handleInputChange: jest.fn(),
      handleSubmit: jest.fn().mockImplementation(async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        return Promise.resolve();
      }),
    });

    renderComponent();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('toggles password visibility', () => {
    renderComponent();
    const passwordInput = screen.getByLabelText(/^password/i);
    const toggleButton = screen.getAllByRole('button')[0];
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});