import { renderHook, act } from '@testing-library/react-hooks';
import { useDeleteConfirm } from '../useDeleteConfirm';

describe('useDeleteConfirm', () => {
  it('should initialize with isDeleting as false', () => {
    const { result } = renderHook(() => useDeleteConfirm(() => {}, () => {}));
    expect(result.current.isDeleting).toBe(false);
  });

  it('should handle successful confirmation', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();

    const { result } = renderHook(() => useDeleteConfirm(onConfirm, onClose));

    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(result.current.isDeleting).toBe(false);
  });

  it('should handle failed confirmation', async () => {
    const error = new Error('Delete failed');
    const onConfirm = jest.fn().mockRejectedValue(error);
    const onClose = jest.fn();

    const { result } = renderHook(() => useDeleteConfirm(onConfirm, onClose));

    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(result.current.isDeleting).toBe(false);
  });

  it('should set isDeleting to true while confirming', async () => {
    const onConfirm = jest.fn().mockImplementation(() => new Promise(resolve => {
      setTimeout(resolve, 100);
    }));
    const onClose = jest.fn();

    const { result } = renderHook(() => useDeleteConfirm(onConfirm, onClose));

    const confirmPromise = act(async () => {
      await result.current.handleConfirm();
    });

    expect(result.current.isDeleting).toBe(true);
    await confirmPromise;
    expect(result.current.isDeleting).toBe(false);
  });
});