import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { createAppTheme } from '../../theme/theme';
import { getAppTheme } from '../../api/settings';

// Mock the theme creation
jest.mock('../../theme/theme', () => ({
  createAppTheme: jest.fn().mockReturnValue({})
}));

// Mock the API call
jest.mock('../../api/settings', () => ({
  getAppTheme: jest.fn()
}));

// Mock component to test useTheme hook
const TestComponent = () => {
  const { mode, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-mode">{mode}</span>
      <button data-testid="theme-toggle" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  let localStorageMock: { [key: string]: string };
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    localStorageMock = {};
    jest.clearAllMocks();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(key => localStorageMock[key]),
        setItem: jest.fn((key, value) => {
          localStorageMock[key] = value;
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
        removeItem: jest.fn((key) => {
          delete localStorageMock[key];
        }),
      },
      writable: true
    });

    // Mock matchMedia for system theme detection
    matchMediaMock = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    // Default mock for getAppTheme
    (getAppTheme as jest.Mock).mockResolvedValue({ theme: 'light' });
  });

  it('should initialize with light theme when no theme is stored', async () => {
    (getAppTheme as jest.Mock).mockResolvedValue({ theme: 'light' });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    });
    expect(createAppTheme).toHaveBeenCalledWith('light');
    expect(getAppTheme).toHaveBeenCalled();
  });

  it('should load theme from app settings when available', async () => {
    (getAppTheme as jest.Mock).mockResolvedValue({ theme: 'dark' });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    });
    expect(createAppTheme).toHaveBeenCalledWith('dark');
    expect(getAppTheme).toHaveBeenCalled();
  });

  it('should handle system theme preference', async () => {
    (getAppTheme as jest.Mock).mockResolvedValue({ theme: 'system' });
    matchMediaMock.mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    });
    expect(getAppTheme).toHaveBeenCalled();
  });

  it('should toggle theme when triggered', async () => {
    (getAppTheme as jest.Mock).mockResolvedValue({ theme: 'light' });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    }, { timeout: 3000 });

    const toggleButton = screen.getByTestId('theme-toggle');

    // Clear previous calls
    (localStorage.setItem as jest.Mock).mockClear();

    act(() => {
      toggleButton.click();
    });

    // Wait for the state to update
    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    }, { timeout: 3000 });
    
    expect(localStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');

    act(() => {
      toggleButton.click();
    });

    // Wait for the state to update back
    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    }, { timeout: 3000 });
    expect(localStorage.setItem).toHaveBeenCalledWith('themeMode', 'light');
  }, 10000);

  it('should persist theme changes to localStorage', async () => {
    (getAppTheme as jest.Mock).mockResolvedValue({ theme: 'light' });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toBeInTheDocument();
    });

    act(() => {
      screen.getByTestId('theme-toggle').click();
    });

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
    });
  });

  it('should provide theme context through useTheme hook', async () => {
    (getAppTheme as jest.Mock).mockResolvedValue({ theme: 'light' });

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('theme-mode')).toBeInTheDocument();
      expect(getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  it('should fallback to localStorage when API call fails', async () => {
    localStorageMock['themeMode'] = 'dark';
    (getAppTheme as jest.Mock).mockRejectedValue(new Error('API error'));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    });
  });

  it('should update theme when appThemeUpdated event is dispatched', async () => {
    (getAppTheme as jest.Mock)
      .mockResolvedValueOnce({ theme: 'light' })
      .mockResolvedValueOnce({ theme: 'dark' });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    });

    act(() => {
      window.dispatchEvent(new Event('appThemeUpdated'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    });
  });
});