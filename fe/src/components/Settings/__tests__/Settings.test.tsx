import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from '../Settings';
import { useAuth } from '../../../context/AuthContext';

// Mock the child components
jest.mock('../UserManager', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="user-manager">User Manager</div>
  }
});

jest.mock('../TypesAndRolesManager', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="types-roles-manager">Types & Roles Manager</div>
  }
});

jest.mock('../SystemSettings', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="system-settings">System Settings</div>
  }
});

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('Settings', () => {
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    // Reset mock before each test
    mockUseAuth.mockReset();
    // Default mock implementation
    mockUseAuth.mockImplementation(() => ({
      permissionsLoading: false,
      currentUser: null,
      login: jest.fn(),
      logout: jest.fn(),
      hasPermission: jest.fn(),
      error: null,
      userPermissions: []
    }));
  });

  it('should show loading spinner when permissions are loading', () => {
    mockUseAuth.mockImplementation(() => ({
      permissionsLoading: true
    }));

    render(<Settings />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render Settings title and tabs when loaded', () => {
    render(<Settings />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Types & Roles')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('should show UserManager by default', () => {
    render(<Settings />);

    expect(screen.getByTestId('user-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('types-roles-manager')).not.toBeInTheDocument();
    expect(screen.queryByTestId('system-settings')).not.toBeInTheDocument();
  });

  it('should switch to Types & Roles tab when clicked', () => {
    render(<Settings />);

    fireEvent.click(screen.getByText('Types & Roles'));

    expect(screen.queryByTestId('user-manager')).not.toBeInTheDocument();
    expect(screen.getByTestId('types-roles-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('system-settings')).not.toBeInTheDocument();
  });

  it('should switch to System tab when clicked', () => {
    render(<Settings />);

    fireEvent.click(screen.getByText('System'));

    expect(screen.queryByTestId('user-manager')).not.toBeInTheDocument();
    expect(screen.queryByTestId('types-roles-manager')).not.toBeInTheDocument();
    expect(screen.getByTestId('system-settings')).toBeInTheDocument();
  });

  it('should maintain tab state when switching between tabs', async () => {
    render(<Settings />);

    // Switch to Types & Roles
    fireEvent.click(screen.getByText('Types & Roles'));
    expect(screen.getByTestId('types-roles-manager')).toBeInTheDocument();

    // Switch to System
    fireEvent.click(screen.getByText('System'));
    expect(screen.getByTestId('system-settings')).toBeInTheDocument();

    // Switch back to Users
    fireEvent.click(screen.getByText('Users'));
    expect(screen.getByTestId('user-manager')).toBeInTheDocument();
  });

  it('should render correctly with all tab navigation', () => {
    render(<Settings />);

    const tabPanels = [
      { tab: 'Users', testId: 'user-manager' },
      { tab: 'Types & Roles', testId: 'types-roles-manager' },
      { tab: 'System', testId: 'system-settings' }
    ];

    tabPanels.forEach(({ tab, testId }) => {
      fireEvent.click(screen.getByText(tab));
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  });

  it('should handle tab changes with correct aria-selected state', () => {
    render(<Settings />);

    const userTab = screen.getByText('Users').closest('[role="tab"]');
    const typesRolesTab = screen.getByText('Types & Roles').closest('[role="tab"]');
    const systemTab = screen.getByText('System').closest('[role="tab"]');

    expect(userTab).toHaveAttribute('aria-selected', 'true');
    expect(typesRolesTab).toHaveAttribute('aria-selected', 'false');
    expect(systemTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(typesRolesTab!);
    expect(userTab).toHaveAttribute('aria-selected', 'false');
    expect(typesRolesTab).toHaveAttribute('aria-selected', 'true');
    expect(systemTab).toHaveAttribute('aria-selected', 'false');
  });
});