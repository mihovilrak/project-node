import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskProgressField } from '../TaskProgressField';

describe('TaskProgressField', () => {
  const defaultProps = {
    value: 50,
    handleChange: jest.fn()
  };

  it('renders progress field correctly', () => {
    render(<TaskProgressField {...defaultProps} />);
    const input = screen.getByLabelText('Progress (%)');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
  });

  it('displays the provided value', () => {
    render(<TaskProgressField {...defaultProps} />);
    const input = screen.getByLabelText('Progress (%)') as HTMLInputElement;
    expect(input.value).toBe('50');
  });

  it('calls handleChange when value changes', () => {
    render(<TaskProgressField {...defaultProps} />);
    const input = screen.getByLabelText('Progress (%)');
    
    fireEvent.change(input, { target: { value: '75' } });
    
    expect(defaultProps.handleChange).toHaveBeenCalled();
    expect(defaultProps.handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: '75',
          name: 'progress'
        })
      })
    );
  });

  it('enforces min and max constraints', () => {
    render(<TaskProgressField {...defaultProps} />);
    const input = screen.getByLabelText('Progress (%)');
    
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
    expect(input).toHaveAttribute('step', '1');
  });

  it('has proper material-ui styling', () => {
    render(<TaskProgressField {...defaultProps} />);
    const textField = screen.getByLabelText('Progress (%)').closest('div');
    expect(textField).toHaveStyle({ marginBottom: '16px' }); // mb: 2 converts to 16px
  });

  it('renders as a full width input', () => {
    render(<TaskProgressField {...defaultProps} />);
    const textField = screen.getByLabelText('Progress (%)').closest('div');
    expect(textField).toHaveClass('MuiTextField-root');
    expect(textField).toHaveStyle({ width: '100%' });
  });
});