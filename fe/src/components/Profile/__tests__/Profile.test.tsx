import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from '../Profile';

// Mock all child components
jest.mock('../ProfileHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-header" />
}));

jest.mock('../ProfileStats', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-stats" />
}));

jest.mock('../ProfileTaskList', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-task-list" />
}));

jest.mock('../ProfileProjectList', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-project-list" />
}));

jest.mock('../ProfileEditDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-edit-dialog" />
}));

jest.mock('../PasswordChangeDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="password-change-dialog" />
}));

// Mock functions
const mockSetEditDialogOpen = jest.fn();
const mockSetPasswordDialogOpen = jest.fn();
const mockSetUpdateSuccess = jest.fn();
const mockHandleProfileUpdate = jest.fn();
const mockHandleTaskClick = jest.fn();

// Create a mock for the useProfileData hook
const mockUseProfileData = {
  profile: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  },
  recentTasks: [],
  recentProjects: [],
  loading: false,
  error: null,
  editDialogOpen: false,
  passwordDialogOpen: false,
  updateSuccess: false,
  setEditDialogOpen: mockSetEditDialogOpen,
  setPasswordDialogOpen: mockSetPasswordDialogOpen,
  setUpdateSuccess: mockSetUpdateSuccess,
  handleProfileUpdate: mockHandleProfileUpdate,
  handleTaskClick: mockHandleTaskClick,
  getTypedProfile: () => ({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  }),
  getProfileStats: () => ({
    totalTasks: 10,
    completedTasks: 5,
    activeProjects: 2,
    totalHours: 100
  })
};

// Mock the useProfileData hook
jest.mock('../../../hooks/profile/useProfileData', () => ({
  useProfileData: jest.fn()
}));

// Import the mocked module
import { useProfileData } from '../../../hooks/profile/useProfileData';

describe('Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock implementation
    (useProfileData as jest.Mock).mockReturnValue(mockUseProfileData);
  });

  test('renders loading state', () => {
    // Override the mock for this specific test
    (useProfileData as jest.Mock).mockReturnValue({
      ...mockUseProfileData,
      loading: true
    });
    
    render(<Profile />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error state', () => {
    // Override the mock for this specific test
    (useProfileData as jest.Mock).mockReturnValue({
      ...mockUseProfileData,
      loading: false,
      error: 'Error message'
    });
    
    render(<Profile />);
    expect(screen.getByRole('alert')).toHaveTextContent('Error message');
  });

  test('renders all components when data is loaded', () => {
    render(<Profile />);
    expect(screen.getByTestId('profile-header')).toBeInTheDocument();
    expect(screen.getByTestId('profile-stats')).toBeInTheDocument();
    expect(screen.getByTestId('profile-task-list')).toBeInTheDocument();
    expect(screen.getByTestId('profile-project-list')).toBeInTheDocument();
  });

  test('handles edit profile button click', () => {
    render(<Profile />);
    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);
    expect(mockSetEditDialogOpen).toHaveBeenCalledWith(true);
  });

  test('handles change password button click', () => {
    render(<Profile />);
    const passwordButton = screen.getByText('Change Password');
    fireEvent.click(passwordButton);
    expect(mockSetPasswordDialogOpen).toHaveBeenCalledWith(true);
  });

  test('shows success alert when update is successful', () => {
    // Override the mock for this specific test
    (useProfileData as jest.Mock).mockReturnValue({
      ...mockUseProfileData,
      updateSuccess: true
    });
    
    render(<Profile />);
    expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
  });

  test('handles success alert dismissal', () => {
    // Override the mock for this specific test
    (useProfileData as jest.Mock).mockReturnValue({
      ...mockUseProfileData,
      updateSuccess: true
    });
    
    render(<Profile />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockSetUpdateSuccess).toHaveBeenCalledWith(false);
  });
});