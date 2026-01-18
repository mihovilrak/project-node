import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { createAppTheme } from '../../theme/theme';

// Mock the theme creation
jest.mock('../../theme/theme', () => ({
  createAppTheme: jest.fn().mockReturnValue({})
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

  beforeEach(() => {
    localStorageMock = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(key => localStorageMock[key]),
        setItem: jest.fn((key, value) => {
          localStorageMock[key] = value;
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true
    });
  });

  it('should initialize with light theme when no theme is stored', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    expect(createAppTheme).toHaveBeenCalledWith('light');
  });

  it('should load theme from localStorage if available', () => {
    localStorageMock['themeMode'] = 'dark';

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(createAppTheme).toHaveBeenCalledWith('dark');
  });

  it('should toggle theme when triggered', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('theme-toggle');

    act(() => {
      toggleButton.click();
    });

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');

    act(() => {
      toggleButton.click();
    });

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    expect(localStorage.setItem).toHaveBeenCalledWith('themeMode', 'light');
  });

  it('should persist theme changes to localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByTestId('theme-toggle').click();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
  });

  it('should provide theme context through useTheme hook', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(getByTestId('theme-mode')).toBeInTheDocument();
    expect(getByTestId('theme-toggle')).toBeInTheDocument();
  });
});