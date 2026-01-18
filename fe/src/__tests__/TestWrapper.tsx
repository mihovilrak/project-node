// src/integration/TestWrapper.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthProvider } from '../context/AuthContext';
import { createAppTheme } from '../theme/theme';
import { render, RenderOptions, RenderResult } from '@testing-library/react';

interface TestWrapperProps {
  children: React.ReactNode;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  const theme = createAppTheme('light');

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Custom render method that includes providers
type CustomRenderOptions = {
  route?: string;
} & Omit<RenderOptions, 'wrapper'>;

export function customRender(
  ui: React.ReactElement,
  options?: CustomRenderOptions
): RenderResult {
  // Set up any specific route if provided
  if (options?.route) {
    window.history.pushState({}, 'Test page', options.route);
  }

  // Return the rendered UI with providers wrapped
  return render(ui, {
    wrapper: TestWrapper,
    ...options,
  });
}

// Simple test to ensure this file is recognized as a test file
describe('TestWrapper', () => {
  it('should export TestWrapper component', () => {
    expect(TestWrapper).toBeDefined();
  });

  it('should export customRender function', () => {
    expect(customRender).toBeDefined();
  });
});