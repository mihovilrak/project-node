import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentForm from '../CommentForm';

const mockOnSubmit = jest.fn();

describe('CommentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('renders comment input field', () => {
    render(<CommentForm onSubmit={mockOnSubmit} />);
    expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
  });

  it('limits input length and shows a character counter', async () => {
    render(<CommentForm onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText('Add a comment...');
    expect(input).toHaveAttribute('maxLength', '400');
    expect(screen.getByText('0/400')).toBeInTheDocument();

    await userEvent.type(input, 'Hello');
    expect(screen.getByText('5/400')).toBeInTheDocument();
  });

  it('disables submit button when input is empty', () => {
    render(<CommentForm onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables submit button when input has text', async () => {
    render(<CommentForm onSubmit={mockOnSubmit} />);
    await userEvent.type(
      screen.getByPlaceholderText('Add a comment...'),
      'Test comment',
    );
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('submits the trimmed text and clears the input', async () => {
    render(<CommentForm onSubmit={mockOnSubmit} />);
    await userEvent.type(
      screen.getByPlaceholderText('Add a comment...'),
      'Test comment',
    );
    await userEvent.click(screen.getByRole('button'));
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith('Test comment');
    expect(screen.getByPlaceholderText('Add a comment...')).toHaveValue('');
  });

  it('keeps the text and shows the error when submit fails', async () => {
    mockOnSubmit.mockRejectedValueOnce(new Error('Comment too long'));
    render(<CommentForm onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText('Add a comment...');
    await userEvent.type(input, 'Test comment');
    await userEvent.click(screen.getByRole('button'));
    expect(await screen.findByText('Comment too long')).toBeInTheDocument();
    expect(input).toHaveValue('Test comment');
  });

  it('disables input when disabled', () => {
    render(<CommentForm onSubmit={mockOnSubmit} disabled />);
    expect(screen.getByPlaceholderText('Add a comment...')).toBeDisabled();
  });
});
