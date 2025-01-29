// src/integration/TestWrapper.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from '../context/AuthContext';
import { createAppTheme } from '../theme/theme';

interface TestWrapperProps {
  children: React.ReactNode;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  const theme = createAppTheme('light');

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};