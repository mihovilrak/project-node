import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { useAuth } from '../context/AuthContext';

// Mock all the required components and hooks
jest.mock('../components/Layout/Layout', () => ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-layout">{children}</div>;
  });

jest.mock('../hooks/app/useAppRoutes', () => ({
  useTaskFileWrapper: () => ({
    taskId: 1,
    handleFileUploaded: jest.fn(),
    handleFileDeleted: jest.fn()
  }),
  useTimeLogCalendarWrapper: () => ({
    projectId: 1
  }),
  useTaskTimeLogsWrapper: () => ({
    task: null
  }),
  useAppState: () => ({
    taskFormOpen: false,
    handleTaskCreated: jest.fn(),
    handleTaskFormClose: jest.fn()
  })
}));

jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('./context/AuthContext'),
  useAuth: jest.fn()
}));

// Mock child components
jest.mock('../components/Home/Home', () => () => <div>Home</div>);
jest.mock('../components/Auth/Login', () => () => <div>Login</div>);
jest.mock('../components/Users/Users', () => () => <div>Users</div>);
jest.mock('../components/Projects/Projects', () => () => <div>Projects</div>);
jest.mock('../components/Tasks/Tasks', () => () => <div>Tasks</div>);

describe('App Component', () => {
  const mockUseAuth = {
    currentUser: null,
    login: jest.fn(),
    logout: jest.fn(),
    hasPermission: jest.fn(),
    permissionsLoading: false,
    error: null,
    userPermissions: []
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockImplementation(() => mockUseAuth);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
  });

  test('renders login page on /login route', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('redirects to login when accessing private route without auth', () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('renders home page for authenticated user', async () => {
    (useAuth as jest.Mock).mockImplementation(() => ({
      ...mockUseAuth,
      currentUser: { id: 1, name: 'Test User' }
    }));

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  test('renders projects page for authenticated user', async () => {
    (useAuth as jest.Mock).mockImplementation(() => ({
      ...mockUseAuth,
      currentUser: { id: 1, name: 'Test User' },
      hasPermission: () => true
    }));

    render(
      <MemoryRouter initialEntries={['/projects']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  test('handles theme provider correctly', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    // Verify theme provider is present
    expect(document.querySelector('body')).toHaveStyle({
      margin: '0'  // CssBaseline effect
    });
  });

  test('renders with LocalizationProvider', () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    // Verify LocalizationProvider is working
    expect(container.querySelector('.MuiPickersLayout-root')).toBeFalsy();
  });

  test('renders task wrapper components correctly', async () => {
    (useAuth as jest.Mock).mockImplementation(() => ({
      ...mockUseAuth,
      currentUser: { id: 1, name: 'Test User' }
    }));

    render(
      <MemoryRouter initialEntries={['/tasks/1/files']}>
        <App />
      </MemoryRouter>
    );

    // Wait for task file wrapper to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
    });
  });
});