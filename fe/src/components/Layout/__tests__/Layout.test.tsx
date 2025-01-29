import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router-dom';
import Layout from '../Layout';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '../../../hooks/layout/useNavigation';
import { useTheme } from '../../../context/ThemeContext';

// Mock all required hooks
jest.mock('../../../context/AuthContext');
jest.mock('../../../hooks/layout/useNavigation');
jest.mock('../../../context/ThemeContext');

const mockNavigate = jest.fn();
const mockLogout = jest.fn();
const mockHandleTabChange = jest.fn();
const mockToggleTheme = jest.fn();

describe('Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      logout: mockLogout
    });
    (useNavigation as jest.Mock).mockReturnValue({
      activeTab: 0,
      handleTabChange: mockHandleTabChange
    });
    (useTheme as jest.Mock).mockReturnValue({
      mode: 'light',
      toggleTheme: mockToggleTheme
    });
    jest.spyOn(router, 'useNavigate').mockImplementation(() => mockNavigate);
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
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar
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
    const projectsTab = screen.getByText('Projects');
    fireEvent.click(projectsTab);
    expect(mockHandleTabChange).toHaveBeenCalled();
  });

  it('shows theme toggle with correct tooltip', () => {
    renderLayout();
    expect(screen.getByTitle('Switch to dark mode')).toBeInTheDocument();
    
    // Test theme toggle click
    const themeButton = screen.getByTitle('Switch to dark mode');
    fireEvent.click(themeButton);
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  describe('with authenticated user', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        currentUser: { login: 'testuser' },
        logout: mockLogout
      });
    });

    it('shows user-specific buttons when logged in', () => {
      renderLayout();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('navigates to profile when profile button clicked', () => {
      renderLayout();
      const profileButton = screen.getByText('testuser');
      fireEvent.click(profileButton);
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('calls logout when logout button clicked', () => {
      renderLayout();
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('with unauthenticated user', () => {
    it('does not show user-specific buttons when logged out', () => {
      renderLayout();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /testuser/i })).not.toBeInTheDocument();
    });
  });

  it('applies correct styles to main content area', () => {
    renderLayout();
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveStyle({
      paddingTop: '64px',
      minHeight: '100vh'
    });
  });
});