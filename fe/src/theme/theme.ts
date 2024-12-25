import {
  createTheme,
  ThemeOptions,
  Components,
  Theme
} from '@mui/material/styles';

const components: Components<Theme> = {
  MuiGrid: {
    styleOverrides: {
      root: {
        '&.MuiGrid-container': {
          width: '100%',
          margin: 0,
          padding: 0
        },
        '&.MuiGrid-item': {
          padding: '12px'
        }
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }
    }
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        flexGrow: 1,
        padding: '16px !important',
        '&:last-child': {
          paddingBottom: '16px !important'
        }
      }
    }
  }
};

export const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  components
};

export const darkTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#303030',
      paper: '#424242',
    },
  },
  components
};

export const createAppTheme = (mode: 'light' | 'dark') => {
  return createTheme(mode === 'light' ? lightTheme : darkTheme);
};
