import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../Home';
import { useSystemSettings } from '../../../hooks/setting/useSystemSettings';
import { SystemSettingsState } from '../../../types/setting';

jest.mock('../../../hooks/setting/useSystemSettings');

const mockUseSystemSettings = useSystemSettings as jest.MockedFunction<typeof useSystemSettings>;

const DEFAULT_SETTINGS: SystemSettingsState = {
  settings: {
    id: 1,
    app_name: 'Test App',
    company_name: 'Test Company',
    sender_email: 'test@example.com',
    time_zone: 'UTC',
    theme: 'light',
    welcome_message: '',
    created_on: '2023-01-01',
    updated_on: '2023-01-01'
  },
  loading: false,
  error: null,
  success: false
};

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without welcome message when not provided', () => {
    mockUseSystemSettings.mockReturnValue({
      state: {
        ...DEFAULT_SETTINGS,
        settings: {
          ...DEFAULT_SETTINGS.settings,
          welcome_message: ''
        }
      },
      handleSubmit: jest.fn(),
      handleChange: jest.fn()
    });

    render(<Home />);
    
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByTestId('active-tasks')).toBeInTheDocument();
  });

  it('renders welcome message when provided', () => {
    const testMessage = '<h1>Welcome</h1><p>Test message</p>';
    mockUseSystemSettings.mockReturnValue({
      state: {
        ...DEFAULT_SETTINGS,
        settings: {
          ...DEFAULT_SETTINGS.settings,
          welcome_message: testMessage
        }
      },
      handleSubmit: jest.fn(),
      handleChange: jest.fn()
    });

    render(<Home />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome');
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('applies correct styling to headings in welcome message', () => {
    const testMessage = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>';
    mockUseSystemSettings.mockReturnValue({
      state: {
        ...DEFAULT_SETTINGS,
        settings: {
          ...DEFAULT_SETTINGS.settings,
          welcome_message: testMessage
        }
      },
      handleSubmit: jest.fn(),
      handleChange: jest.fn()
    });

    render(<Home />);
    
    const headings = screen.getAllByRole('heading');
    headings.forEach(heading => {
      expect(heading).toHaveStyle({ color: 'primary.main' });
      expect(heading).toHaveStyle({ marginBottom: '16px' });
    });
  });

  it('renders ActiveTasks component', () => {
    mockUseSystemSettings.mockReturnValue({
      state: {
        ...DEFAULT_SETTINGS,
        settings: {
          ...DEFAULT_SETTINGS.settings,
          welcome_message: ''
        }
      },
      handleSubmit: jest.fn(),
      handleChange: jest.fn()
    });

    render(<Home />);
    
    expect(screen.getByTestId('active-tasks')).toBeInTheDocument();
  });

  it('sanitizes HTML in welcome message', () => {
    const testMessage = '<h1>Safe</h1><script>alert("unsafe")</script>';
    mockUseSystemSettings.mockReturnValue({
      state: {
        ...DEFAULT_SETTINGS,
        settings: {
          ...DEFAULT_SETTINGS.settings,
          welcome_message: testMessage
        }
      },
      handleSubmit: jest.fn(),
      handleChange: jest.fn()
    });

    render(<Home />);
    
    expect(screen.getByRole('heading')).toHaveTextContent('Safe');
    expect(screen.queryByText('alert("unsafe")')).not.toBeInTheDocument();
  });
});