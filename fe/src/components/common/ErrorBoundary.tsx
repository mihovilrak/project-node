import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catch rendering errors in the component tree and display a fallback error UI.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  /**
   * Log caught errors and their stack traces to the console in non-test environments.
   * @param error The error object thrown during rendering in the component tree.
   * @param errorInfo Additional information about the error including the component stack trace.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV !== 'test') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  /**
   * Display an error message with recovery options when an error is caught, otherwise render child components.
   */
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            An unexpected error occurred. Please try again.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button component={Link} to="/" variant="contained">
              Go to Home
            </Button>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
