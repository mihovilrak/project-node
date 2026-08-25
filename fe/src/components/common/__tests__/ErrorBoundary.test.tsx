import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorBoundary from '../ErrorBoundary';

const ThrowError = (): React.ReactElement => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <div data-testid="child">Child content</div>
        </ErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Child content');
  });

  it('renders fallback UI when child throws', () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
    expect(screen.getByText('Reload page')).toBeInTheDocument();
  });
});
