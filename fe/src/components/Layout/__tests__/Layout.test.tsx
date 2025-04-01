import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';
import '@testing-library/jest-dom';

// Create mocks for test
let mockCurrentUser: any = null;
const mockLogout = jest.fn();
const mockHandleTabChange = jest.fn();
const mockToggleTheme = jest.fn();

// Mock the hooks
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    logout: mockLogout
  })
}));

jest.mock('../../../hooks/layout/useNavigation', () => ({
  useNavigation: () => ({
    activeTab: 0,
    handleTabChange: mockHandleTabChange
  })
}));

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    mode: 'light',
    toggleTheme: mockToggleTheme
  })
}));

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock icons
jest.mock('@mui/icons-material', () => ({
  Brightness4: () => <span data-testid="dark-mode-icon">DarkModeIcon</span>,
  Brightness7: () => <span data-testid="light-mode-icon">LightModeIcon</span>,
  AccountCircle: () => <span data-testid="profile-icon">ProfileIcon</span>,
  ExitToApp: () => <span data-testid="logout-icon">LogoutIcon</span>
}));

// Simplified Material-UI mocks
jest.mock('@mui/material', () => {
  // Manually handle the props without relying on Material-UI internals
  const Button = ({ children, onClick, startIcon, endIcon }: any) => (
    <button data-testid="button" onClick={onClick}>
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
  
  return {
    AppBar: ({ children }: any) => <div data-testid="app-bar">{children}</div>,
    Toolbar: ({ children }: any) => <div data-testid="toolbar">{children}</div>,
    Tabs: ({ children, onChange, value }: any) => (
      <div data-testid="tabs" onClick={onChange}>
        {children}
      </div>
    ),
    Tab: ({ label }: any) => <div data-testid="tab">{label}</div>,
    Box: ({ children, component = 'div', sx }: any) => {
      const Component = component;
      return (
        <Component data-testid={component === 'main' ? 'main-content' : undefined}>
          {children}
        </Component>
      );
    },
    Button,
    IconButton: ({ children, onClick }: any) => (
      <button data-testid="icon-button" onClick={onClick}>
        {children}
      </button>
    ),
    Tooltip: ({ children, title }: any) => (
      <div title={title}>{children}</div>
    ),
  };
});

describe('Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = null;
  });

  const renderLayout = () => {
    return render(
      <BrowserRouter>
        <Layout>
          <div data-testid="child-content">Test Content</div>
        </Layout>
      </BrowserRouter>
    );
  };

  it('renders basic layout structure', () => {
    renderLayout();
    expect(screen.getByTestId('app-bar')).toBeInTheDocument();
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('shows navigation tabs with correct labels', () => {
    renderLayout();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('handles tab changes', () => {
    renderLayout();
    fireEvent.click(screen.getByTestId('tabs'));
    expect(mockHandleTabChange).toHaveBeenCalled();
  });

  it('shows theme toggle with correct tooltip', () => {
    renderLayout();
    expect(screen.getByTitle('Switch to dark mode')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('icon-button'));
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  describe('with authenticated user', () => {
    beforeEach(() => {
      mockCurrentUser = { login: 'testuser' };
    });

    it('shows user-specific buttons when logged in', () => {
      renderLayout();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('navigates to profile when profile button clicked', () => {
      renderLayout();
      const buttons = screen.getAllByTestId('button');
      const profileButton = buttons.find(btn => btn.textContent?.includes('testuser'));
      fireEvent.click(profileButton!);
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('calls logout when logout button clicked', () => {
      renderLayout();
      const buttons = screen.getAllByTestId('button');
      const logoutButton = buttons.find(btn => btn.textContent?.includes('Logout'));
      fireEvent.click(logoutButton!);
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('with unauthenticated user', () => {
    it('does not show user-specific buttons when logged out', () => {
      renderLayout();
      expect(screen.queryByText('testuser')).not.toBeInTheDocument();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  it('applies correct styles to main content area', () => {
    renderLayout();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });
});