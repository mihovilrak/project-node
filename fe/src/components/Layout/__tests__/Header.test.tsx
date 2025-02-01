import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';
import { useHeader } from '../../../hooks/layout/useHeader';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import type { User } from '../../../types/user';

// Mock the custom hook
jest.mock('../../../hooks/layout/useHeader');
const mockedUseHeader = useHeader as jest.MockedFunction<typeof useHeader>;

// Mock NotificationCenter component
jest.mock('../../Notifications/NotificationCenter', () => ({
  __esModule: true,
  default: ({ userId }: { userId?: number }) => (
    <div data-testid="notification-center">
      Notification Center (UserId: {userId})
    </div>
  ),
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
  created_on: '2024-01-01',
  updated_on: null,
  last_login: null
};

const theme = createTheme();

describe('Header', () => {
  const renderHeader = () => {
    return render(
      <ThemeProvider theme={theme}>
        <Header />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with elevation when scrolled', () => {
    mockedUseHeader.mockReturnValue({
      currentUser: mockUser,
      isScrolled: true
    });

    renderHeader();
    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveStyle({ boxShadow: expect.stringContaining('0px 2px 4px') });
  });

  it('renders without elevation when not scrolled', () => {
    mockedUseHeader.mockReturnValue({
      currentUser: mockUser,
      isScrolled: false
    });

    renderHeader();
    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveStyle({ boxShadow: 'none' });
  });

  it('renders notification center with user id when user is present', () => {
    mockedUseHeader.mockReturnValue({
      currentUser: mockUser,
      isScrolled: false
    });

    renderHeader();
    const notificationCenter = screen.getByTestId('notification-center');
    expect(notificationCenter).toHaveTextContent('UserId: 1');
  });

  it('renders notification center without user id when user is null', () => {
    mockedUseHeader.mockReturnValue({
      currentUser: null,
      isScrolled: false
    });

    renderHeader();
    const notificationCenter = screen.getByTestId('notification-center');
    expect(notificationCenter).toHaveTextContent('UserId:');
  });
});