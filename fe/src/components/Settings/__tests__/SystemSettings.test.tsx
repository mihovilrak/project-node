import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SystemSettings from '../SystemSettings';
import { useSystemSettings } from '../../../hooks/setting/useSystemSettings';
import { AppSettings } from '../../../types/setting';

// Mock the hooks
jest.mock('../../../hooks/setting/useSystemSettings');
jest.mock('@tiptap/react', () => ({
  useEditor: () => ({
    chain: () => ({
      focus: () => ({
        toggleBold: () => ({ run: jest.fn() }),
        toggleItalic: () => ({ run: jest.fn() }),
        toggleUnderline: () => ({ run: jest.fn() }),
        toggleHeading: () => ({ run: jest.fn() })
      })
    }),
    isActive: () => false,
    getHTML: () => '<p>Test content</p>',
    commands: {
      setContent: jest.fn()
    }
  }),
  EditorContent: () => <div data-testid="editor-content">Editor Content</div>
}));

const mockSettings: AppSettings = {
  id: 1,
  app_name: 'Test App',
  company_name: 'Test Company',
  sender_email: 'test@example.com',
  time_zone: 'UTC',
  theme: 'light',
  welcome_message: '<p>Welcome</p>'
};

describe('SystemSettings', () => {
  const mockHandleSubmit = jest.fn();
  const mockHandleChange = jest.fn();

  beforeEach(() => {
    (useSystemSettings as jest.Mock).mockReturnValue({
      state: {
        settings: mockSettings,
        loading: false,
        error: null,
        success: false
      },
      handleSubmit: mockHandleSubmit,
      handleChange: mockHandleChange
    });
  });

  it('renders loading state', () => {
    (useSystemSettings as jest.Mock).mockReturnValue({
      state: {
        settings: mockSettings,
        loading: true,
        error: null,
        success: false
      },
      handleSubmit: mockHandleSubmit,
      handleChange: mockHandleChange
    });

    render(<SystemSettings />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders form with initial values', () => {
    render(<SystemSettings />);
    
    expect(screen.getByLabelText(/app name/i)).toHaveValue('Test App');
    expect(screen.getByLabelText(/company name/i)).toHaveValue('Test Company');
    expect(screen.getByLabelText(/sender email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/time zone/i)).toHaveValue('UTC');
    expect(screen.getByLabelText(/theme/i)).toHaveValue('light');
  });

  it('handles form submission', async () => {
    render(<SystemSettings />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('displays success message when update is successful', () => {
    (useSystemSettings as jest.Mock).mockReturnValue({
      state: {
        settings: mockSettings,
        loading: false,
        error: null,
        success: true
      },
      handleSubmit: mockHandleSubmit,
      handleChange: mockHandleChange
    });

    render(<SystemSettings />);
    expect(screen.getByText(/settings updated successfully/i)).toBeInTheDocument();
  });

  it('displays error message when update fails', () => {
    (useSystemSettings as jest.Mock).mockReturnValue({
      state: {
        settings: mockSettings,
        loading: false,
        error: 'Update failed',
        success: false
      },
      handleSubmit: mockHandleSubmit,
      handleChange: mockHandleChange
    });

    render(<SystemSettings />);
    expect(screen.getByText(/update failed/i)).toBeInTheDocument();
  });

  it('switches between editor and preview tabs', async () => {
    render(<SystemSettings />);
    
    const previewTab = screen.getByRole('tab', { name: /preview/i });
    await userEvent.click(previewTab);
    
    expect(screen.getByRole('tabpanel')).toHaveTextContent(/welcome/i);
  });

  it('handles theme change', () => {
    render(<SystemSettings />);
    
    const themeSelect = screen.getByLabelText(/theme/i);
    fireEvent.mouseDown(themeSelect);
    
    const darkOption = screen.getByRole('option', { name: /dark/i });
    fireEvent.click(darkOption);
    
    expect(mockHandleChange).toHaveBeenCalled();
  });

  it('renders rich text editor toolbar', () => {
    render(<SystemSettings />);
    
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /underline/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<SystemSettings />);
    
    const appNameInput = screen.getByLabelText(/app name/i);
    await userEvent.clear(appNameInput);
    fireEvent.submit(screen.getByRole('form'));
    
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});