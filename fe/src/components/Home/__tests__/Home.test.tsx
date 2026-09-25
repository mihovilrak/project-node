import React from 'react';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import Home from '../Home';
import { getSystemSettings, getWelcomeMessage } from '../../../api/settings';
import { BrowserRouter } from 'react-router-dom';
import { getActiveTasks } from '../../../api/tasks';
import { ThemeProvider, createTheme } from '@mui/material';
import AuthProvider from '../../../context/AuthContext';

jest.mock('../../../api/settings');
jest.mock('../../../api/tasks');

const mockGetActiveTasks = getActiveTasks as jest.MockedFunction<
  typeof getActiveTasks
>;
const mockGetWelcomeMessage = getWelcomeMessage as jest.MockedFunction<
  typeof getWelcomeMessage
>;
const mockTheme = createTheme();

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActiveTasks.mockResolvedValue([]);
    mockGetWelcomeMessage.mockResolvedValue({ welcome_message: '' });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={mockTheme}>
          <AuthProvider>{component}</AuthProvider>
        </ThemeProvider>
      </BrowserRouter>,
    );
  };

  const renderWithMessage = async (message: string | null) => {
    mockGetWelcomeMessage.mockResolvedValue({ welcome_message: message });
    renderWithProviders(<Home />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
  };

  it('renders without welcome message when not provided', async () => {
    await renderWithMessage('');

    expect(screen.queryByTestId('welcome-message')).not.toBeInTheDocument();
    expect(screen.getByTestId('active-tasks')).toBeInTheDocument();
  });

  it('loads the welcome message from the public endpoint only', async () => {
    await renderWithMessage('<p>Hello</p>');

    expect(await screen.findByText('Hello')).toBeInTheDocument();
    expect(mockGetWelcomeMessage).toHaveBeenCalledTimes(1);
    expect(getSystemSettings).not.toHaveBeenCalled();
  });

  it('renders welcome message when provided', async () => {
    await renderWithMessage('<h1>Welcome</h1><p>Test message</p>');

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Welcome',
    );
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders welcome message with correct HTML structure', async () => {
    await renderWithMessage('<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>');

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Title',
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Subtitle',
    );
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Section',
    );
  });

  it('renders ActiveTasks when the welcome message fails to load', async () => {
    mockGetWelcomeMessage.mockRejectedValue(new Error('Forbidden'));
    renderWithProviders(<Home />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

    expect(screen.getByTestId('active-tasks')).toBeInTheDocument();
    expect(screen.queryByTestId('welcome-message')).not.toBeInTheDocument();
  });

  it('sanitizes HTML in welcome message', async () => {
    await renderWithMessage('<h1>Safe</h1><script>alert("unsafe")</script>');

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Safe',
    );
    expect(screen.queryByText('alert("unsafe")')).not.toBeInTheDocument();
  });
});
