import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SystemSettings from '../SystemSettings';
import { useSystemSettings } from '../../../hooks/setting/useSystemSettings';
import { AppSettings } from '../../../types/setting';

// Mock the hooks
jest.mock('../../../hooks/setting/useSystemSettings');

// Mock TipTap editor and extensions
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

jest.mock('@tiptap/starter-kit', () => ({}));
jest.mock('@tiptap/extension-underline', () => ({}));

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
    jest.clearAllMocks();
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
    const { container } = render(<SystemSettings />);

    // Find inputs by name
    const appNameInput = container.querySelector('input[name="app_name"]');
    expect(appNameInput).toBeTruthy();
    expect(appNameInput).toHaveValue('Test App');

    // Check that other inputs exist
    expect(container.querySelector('input[name="company_name"]')).toBeTruthy();
    expect(container.querySelector('input[name="sender_email"]')).toBeTruthy();
  });

  it('handles form submission', () => {
    const { container } = render(<SystemSettings />);

    // Find form using DOM query
    const form = container.querySelector('form');
    expect(form).toBeTruthy();

    // Submit form and check handler was called
    fireEvent.submit(form!);
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

  it('renders the component with tabs', () => {
    const { container } = render(<SystemSettings />);

    // Verify the SystemSettings component renders
    expect(screen.getByText(/System Settings/i)).toBeInTheDocument();

    // Verify tabs exist by checking for tab elements
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBeGreaterThan(0);
  });

  it('handles theme change', () => {
    const { container } = render(<SystemSettings />);

    // Find select by name attribute
    const inputs = container.querySelectorAll('input, select');
    const themeInput = Array.from(inputs).find(
      input => input.getAttribute('name') === 'theme'
    );

    // Verify input exists and simulate change
    expect(themeInput).toBeTruthy();
    fireEvent.change(themeInput!, { target: { value: 'dark' } });

    // Verify handler was called
    expect(mockHandleChange).toHaveBeenCalled();
  });

  it('renders editor content', () => {
    render(<SystemSettings />);
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('calls submit handler even when fields are empty', () => {
    const { container } = render(<SystemSettings />);

    // Find and clear app name input
    const appNameInput = container.querySelector('input[name="app_name"]');
    expect(appNameInput).toBeTruthy();
    fireEvent.change(appNameInput!, { target: { value: '' } });

    // Submit form and verify handler was called
    const form = container.querySelector('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form!);
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});