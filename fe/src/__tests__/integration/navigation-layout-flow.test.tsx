import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../TestWrapper';
import App from '../../App';
import { useNavigation } from '../../hooks/layout/useNavigation';
import { useTheme } from '../../context/ThemeContext';
import { useMediaQuery } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

// Mock hooks
jest.mock('../../hooks/layout/useNavigation');
jest.mock('../../context/ThemeContext');
jest.mock('../../context/AuthContext');
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn()
}));

describe('Navigation and Layout Flow', () => {
  const mockHandleTabChange = jest.fn();
  const mockToggleSidebar = jest.fn();
  const mockToggleTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { id: 1, name: 'Test User' },
      isAuthenticated: true
    });
    (useNavigation as jest.Mock).mockReturnValue({
      activeTab: 0,
      handleTabChange: mockHandleTabChange,
      isSidebarOpen: true,
      toggleSidebar: mockToggleSidebar
    });
    (useTheme as jest.Mock).mockReturnValue({
      mode: 'light',
      toggleTheme: mockToggleTheme
    });
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Default to desktop view
  });

  const renderApp = () => {
    return render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
  };

  it('should handle menu navigation correctly', async () => {
    renderApp();
    
    // Verify main navigation elements are present
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
    
    // Click on different menu items and verify navigation
    const tasksLink = screen.getByRole('link', { name: /tasks/i });
    await userEvent.click(tasksLink);
    expect(window.location.pathname).toBe('/tasks');
    
    const projectsLink = screen.getByRole('link', { name: /projects/i });
    await userEvent.click(projectsLink);
    expect(window.location.pathname).toBe('/projects');
    
    const calendarLink = screen.getByRole('link', { name: /calendar/i });
    await userEvent.click(calendarLink);
    expect(window.location.pathname).toBe('/calendar');
  });

  it('should display and update breadcrumb navigation', async () => {
    renderApp();
    
    // Verify breadcrumb is present
    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(breadcrumb).toBeInTheDocument();
    
    // Navigate to a nested route
    const projectsLink = screen.getByRole('link', { name: /projects/i });
    await userEvent.click(projectsLink);
    
    // Create new project to test nested navigation
    const newProjectButton = screen.getByRole('link', { name: /new project/i });
    await userEvent.click(newProjectButton);
    
    // Verify breadcrumb updates
    await waitFor(() => {
      expect(screen.getByText(/projects/i)).toBeInTheDocument();
      expect(screen.getByText(/new/i)).toBeInTheDocument();
    });
  });

  it('should handle sidebar collapse/expand', async () => {
    renderApp();
    
    // Find and click sidebar toggle button
    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
    await userEvent.click(toggleButton);
    
    expect(mockToggleSidebar).toHaveBeenCalled();
    
    // Verify sidebar state changes
    await waitFor(() => {
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveAttribute('data-open', 'false');
    });
  });

  it('should handle responsive layout behavior', async () => {
    // Mock mobile view
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    
    renderApp();
    
    // Verify sidebar is hidden by default on mobile
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveStyle({ transform: 'translateX(-100%)' });
    
    // Toggle sidebar on mobile
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await userEvent.click(menuButton);
    
    expect(mockToggleSidebar).toHaveBeenCalled();
  });

  it('should handle mobile view transitions', async () => {
    // Mock mobile view
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    
    renderApp();
    
    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await userEvent.click(menuButton);
    
    // Navigate to tasks
    const tasksLink = screen.getByRole('link', { name: /tasks/i });
    await userEvent.click(tasksLink);
    
    // Verify sidebar closes automatically on mobile after navigation
    expect(mockToggleSidebar).toHaveBeenCalled();
    
    // Verify smooth transition
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveStyle({ transition: expect.stringContaining('transform') });
  });
});
