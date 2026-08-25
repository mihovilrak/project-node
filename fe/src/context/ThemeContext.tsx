import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback
} from 'react';
import {
    ThemeProvider
    as MuiThemeProvider
} from '@mui/material/styles';
import { createAppTheme } from '../theme/theme';
import { ThemeContextType } from '../types/admin';
import { getAppTheme } from '../api/settings';
import logger from '../utils/logger';

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// Helper function to detect system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Helper function to resolve theme from app settings
const resolveTheme = (appTheme: 'light' | 'dark' | 'system'): 'light' | 'dark' => {
  if (appTheme === 'system') {
    return getSystemTheme();
  }
  return appTheme;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    // Initialize with localStorage as fallback, will be updated when app theme is fetched
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as 'light' | 'dark') || 'light';
  });
  const [appTheme, setAppTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch app theme from server
  const fetchAppTheme = useCallback(async () => {
    try {
      const response = await getAppTheme();
      const theme = response.theme || 'light';
      setAppTheme(theme);
      const resolvedMode = resolveTheme(theme);
      setMode(resolvedMode);
      localStorage.setItem('themeMode', resolvedMode);
    } catch (error) {
      logger.error('Failed to fetch app theme:', error);
      // Fallback to localStorage or default
      const savedMode = localStorage.getItem('themeMode');
      setMode((savedMode as 'light' | 'dark') || 'light');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchAppTheme();
  }, [fetchAppTheme]);

  // Listen for system theme changes when app theme is 'system'
  useEffect(() => {
    if (appTheme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setMode(e.matches ? 'dark' : 'light');
      localStorage.setItem('themeMode', e.matches ? 'dark' : 'light');
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [appTheme]);

  // Listen for storage events to detect theme changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'appThemeUpdated') {
        // Refetch app theme when it's updated
        fetchAppTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchAppTheme]);

  // Listen for custom event when theme is updated in same tab
  useEffect(() => {
    const handleThemeUpdate = () => {
      fetchAppTheme();
    };

    window.addEventListener('appThemeUpdated', handleThemeUpdate);
    return () => window.removeEventListener('appThemeUpdated', handleThemeUpdate);
  }, [fetchAppTheme]);

  const toggleTheme = () => {
    // Allow user to toggle theme regardless of app theme setting
    // This provides user preference override
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const theme = createAppTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
