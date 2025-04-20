import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserDetails from '../UserDetails';
import { getUserById } from '../../../api/users';
import { User } from '../../../types/user';

// Mock the router hook
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' })
}));

// Mock the API call
jest.mock('../../../api/users', () => ({
  getUserById: jest.fn()
}));

const mockUser: User = {
  id: 1,
  login: 'testuser',
  name: 'Test',
  surname: 'User',
  email: 'test@example.com',
  role_id: 1,
  status_id: 1,
  avatar_url: null,
  created_on: '2023-01-01T12:00:00Z',
  updated_on: '2023-01-02T12:00:00Z',
  last_login: '2023-01-03T12:00:00Z',
  role_name: 'Admin',
  status_name: 'Active',
  status_color: 'green'
};

describe('UserDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (getUserById as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<UserDetails />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    const errorMessage = 'Failed to fetch user details';
    (getUserById as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<UserDetails />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays user details correctly when API call succeeds', async () => {
    (getUserById as jest.Mock).mockResolvedValue(mockUser);

    render(<UserDetails />);

    await waitFor(() => {
      expect(screen.getByText(mockUser.login)).toBeInTheDocument();
      expect(screen.getByText(`ID: ${mockUser.id}`)).toBeInTheDocument();
      expect(screen.getByText(`Name: ${mockUser.name}`)).toBeInTheDocument();
      expect(screen.getByText(`Surname: ${mockUser.surname}`)).toBeInTheDocument();
      expect(screen.getByText(`Email: ${mockUser.email}`)).toBeInTheDocument();
      expect(screen.getByText(`Status: ${mockUser.status_name}`)).toBeInTheDocument();
      expect(screen.getByText(`Role: ${mockUser.role_name}`)).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    (getUserById as jest.Mock).mockResolvedValue(mockUser);

    render(<UserDetails />);

    await waitFor(() => {
      // Check for formatted dates (adjust expected format based on your locale)
      expect(screen.getByText(/Created on: 01\.01\.2023/)).toBeInTheDocument();
      expect(screen.getByText(/Last updated: 02\.01\.2023/)).toBeInTheDocument();
      expect(screen.getByText(/Last login: 03\.01\.2023/)).toBeInTheDocument();
    });
  });

  it('handles null values properly', async () => {
    const userWithNulls = {
      ...mockUser,
      status_name: null,
      role_name: null,
      updated_on: null,
      last_login: null
    };
    
    (getUserById as jest.Mock).mockResolvedValue(userWithNulls);

    render(<UserDetails />);

    await waitFor(() => {
      expect(screen.getByText(
        (content, element) => {
          return element?.textContent?.replace(/\s+/g, ' ').trim() === 'Status: -'
        }
      )).toBeInTheDocument();
      expect(screen.getByText(
        (content, element) => {
          return element?.textContent?.replace(/\s+/g, ' ').trim() === 'Role: -'
        }
      )).toBeInTheDocument();
      expect(screen.getByText(
        (content, element) => {
          return element?.textContent?.replace(/\s+/g, ' ').trim() === 'Last updated: -'
        }
      )).toBeInTheDocument();
      expect(screen.getByText(
        (content, element) => {
          return element?.textContent?.replace(/\s+/g, ' ').trim() === 'Last login: -'
        }
      )).toBeInTheDocument();
    });
  });

  it('calls getUserById with correct ID', async () => {
    (getUserById as jest.Mock).mockResolvedValue(mockUser);

    render(<UserDetails />);

    await waitFor(() => {
      expect(getUserById).toHaveBeenCalledWith(1);
    });
  });
});