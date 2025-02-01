import { renderHook, act } from '@testing-library/react-hooks';
import { useSystemSettings } from '../useSystemSettings';
import { getSystemSettings, updateSystemSettings } from '../../../api/settings';
import { AppSettings } from '../../../types/setting';

// Mock the API calls
jest.mock('../../../api/settings');

describe('useSystemSettings', () => {
  const mockSettings: AppSettings = {
    id: 1,
    app_name: 'Test App',
    company_name: 'Test Company',
    sender_email: 'test@example.com',
    time_zone: 'UTC',
    theme: 'system',
    welcome_message: 'Welcome to Test App'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch system settings on mount', async () => {
    (getSystemSettings as jest.Mock).mockResolvedValueOnce(mockSettings);

    const { result, waitForNextUpdate } = renderHook(() => useSystemSettings());

    expect(result.current.state.loading).toBe(true);
    await waitForNextUpdate();

    expect(getSystemSettings).toHaveBeenCalledTimes(1);
    expect(result.current.state.settings).toEqual(mockSettings);
    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    const error = new Error('Failed to fetch system settings');
    (getSystemSettings as jest.Mock).mockRejectedValueOnce(error);

    const { result, waitForNextUpdate } = renderHook(() => useSystemSettings());

    expect(result.current.state.loading).toBe(true);
    await waitForNextUpdate();

    expect(getSystemSettings).toHaveBeenCalledTimes(1);
    expect(result.current.state.error).toBe('Failed to fetch system settings');
    expect(result.current.state.loading).toBe(false);
  });

  it('should update system settings successfully', async () => {
    (getSystemSettings as jest.Mock).mockResolvedValueOnce(mockSettings);
    (updateSystemSettings as jest.Mock).mockResolvedValueOnce(undefined);

    const { result, waitForNextUpdate } = renderHook(() => useSystemSettings());
    await waitForNextUpdate();

    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(updateSystemSettings).toHaveBeenCalledWith(mockSettings);
    expect(result.current.state.success).toBe(true);
    expect(result.current.state.error).toBeNull();
  });

  it('should handle update error', async () => {
    (getSystemSettings as jest.Mock).mockResolvedValueOnce(mockSettings);
    const error = new Error('Failed to update settings');
    (updateSystemSettings as jest.Mock).mockRejectedValueOnce(error);

    const { result, waitForNextUpdate } = renderHook(() => useSystemSettings());
    await waitForNextUpdate();

    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(updateSystemSettings).toHaveBeenCalledWith(mockSettings);
    expect(result.current.state.error).toBe('Failed to update system settings');
    expect(result.current.state.success).toBe(false);
  });

  it('should handle input changes', async () => {
    (getSystemSettings as jest.Mock).mockResolvedValueOnce(mockSettings);

    const { result, waitForNextUpdate } = renderHook(() => useSystemSettings());
    await waitForNextUpdate();

    act(() => {
      const mockEvent = {
        target: { name: 'app_name', value: 'New App Name' }
      } as React.ChangeEvent<HTMLInputElement>;
      
      result.current.handleChange(mockEvent);
    });

    expect(result.current.state.settings.app_name).toBe('New App Name');
  });
});
