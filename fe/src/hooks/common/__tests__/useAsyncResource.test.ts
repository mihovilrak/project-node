import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsyncResource } from '../useAsyncResource';
import logger from '../../../utils/logger';

const deferred = <T>() => {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

describe('useAsyncResource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads data once and clears the loading flag', async () => {
    const fetcher = jest.fn().mockResolvedValue(['a']);
    const { result } = renderHook(() =>
      useAsyncResource<string[]>(fetcher, [], { initialData: [] }),
    );

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(['a']);
    expect(result.current.error).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('skips the fetch while disabled', () => {
    const fetcher = jest.fn();
    const { result } = renderHook(() =>
      useAsyncResource<string[]>(fetcher, [], {
        initialData: [],
        enabled: false,
      }),
    );

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('reports errors through getApiErrorMessage and resets data', async () => {
    const fetcher = jest.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 404, data: {} },
    });
    const { result } = renderHook(() =>
      useAsyncResource<string[]>(fetcher, [], {
        initialData: [],
        errorMessage: 'Failed to load things',
      }),
    );

    await waitFor(() =>
      expect(result.current.error).toBe('The requested item was not found'),
    );
    expect(result.current.data).toEqual([]);
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to load things',
      expect.anything(),
    );
  });

  it('ignores a stale response after the deps change', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const signals: AbortSignal[] = [];
    const fetcher = jest.fn((signal: AbortSignal) => {
      signals.push(signal);
      return signals.length === 1 ? first.promise : second.promise;
    });
    const { result, rerender } = renderHook(
      ({ id }) => useAsyncResource<string>(fetcher, [id], { initialData: '' }),
      { initialProps: { id: 1 } },
    );

    rerender({ id: 2 });
    expect(signals[0].aborted).toBe(true);

    await act(async () => {
      second.resolve('fresh');
      await second.promise;
    });
    await act(async () => {
      first.resolve('stale');
      await first.promise;
    });

    expect(result.current.data).toBe('fresh');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('keeps the previous data while refetching', async () => {
    const next = deferred<string>();
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce('first')
      .mockReturnValueOnce(next.promise);
    const { result } = renderHook(() =>
      useAsyncResource<string>(fetcher, [], { initialData: '' }),
    );
    await waitFor(() => expect(result.current.data).toBe('first'));

    let refetch: Promise<void> = Promise.resolve();
    act(() => {
      refetch = result.current.refetch();
    });
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe('first');

    await act(async () => {
      next.resolve('second');
      await refetch;
    });
    expect(result.current.data).toBe('second');
    expect(result.current.loading).toBe(false);
  });

  it('aborts the in-flight request on unmount', () => {
    let captured: AbortSignal | undefined;
    const fetcher = jest.fn((signal: AbortSignal) => {
      captured = signal;
      return new Promise<string>(() => {});
    });
    const { unmount } = renderHook(() =>
      useAsyncResource<string>(fetcher, [], { initialData: '' }),
    );

    unmount();
    expect(captured?.aborted).toBe(true);
  });

  it('does not fetch when refetch is called after unmount', async () => {
    const fetcher = jest.fn().mockResolvedValue('a');
    const { result, unmount } = renderHook(() =>
      useAsyncResource<string>(fetcher, [], { initialData: '' }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    const { refetch } = result.current;

    unmount();
    await refetch();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  describe('polling', () => {
    let hidden = false;

    beforeAll(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => hidden,
      });
    });

    afterAll(() => {
      delete (document as { hidden?: boolean }).hidden;
    });

    let setIntervalSpy: jest.SpyInstance;
    let clearIntervalSpy: jest.SpyInstance;

    beforeEach(() => {
      hidden = false;
      jest.useFakeTimers();
      setIntervalSpy = jest.spyOn(global, 'setInterval');
      clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    });

    afterEach(() => {
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
      jest.useRealTimers();
    });

    const activeIntervals = () => {
      const cleared = new Set(clearIntervalSpy.mock.calls.map(([id]) => id));
      return setIntervalSpy.mock.results.filter(
        ({ value }) => !cleared.has(value),
      ).length;
    };

    const tick = async (ms: number) => {
      await act(async () => {
        jest.advanceTimersByTime(ms);
      });
    };

    const setHidden = async (value: boolean) => {
      hidden = value;
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
    };

    type Props = { id: number; enabled: boolean; pollIntervalMs: number };

    const renderPolling = (fetcher: jest.Mock, props: Partial<Props> = {}) =>
      renderHook(
        ({ id, enabled, pollIntervalMs }: Props) =>
          useAsyncResource<string>(fetcher, [id], {
            initialData: '',
            enabled,
            pollIntervalMs,
          }),
        {
          initialProps: {
            id: 1,
            enabled: true,
            pollIntervalMs: 1000,
            ...props,
          },
        },
      );

    it('refetches on the interval', async () => {
      const fetcher = jest.fn().mockResolvedValue('a');
      renderPolling(fetcher);
      await tick(0);
      expect(fetcher).toHaveBeenCalledTimes(1);

      await tick(1000);
      expect(fetcher).toHaveBeenCalledTimes(2);
      await tick(1000);
      expect(fetcher).toHaveBeenCalledTimes(3);
    });

    it('clears the interval on unmount', async () => {
      const fetcher = jest.fn().mockResolvedValue('a');
      const { unmount } = renderPolling(fetcher);
      await tick(0);

      unmount();
      await tick(5000);
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(activeIntervals()).toBe(0);
    });

    it('restarts the interval on a deps change without duplicating it', async () => {
      const fetcher = jest.fn().mockResolvedValue('a');
      const { rerender } = renderPolling(fetcher);
      await tick(500);

      rerender({ id: 2, enabled: true, pollIntervalMs: 1000 });
      await tick(0);
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(activeIntervals()).toBe(1);

      await tick(500);
      expect(fetcher).toHaveBeenCalledTimes(2);
      await tick(500);
      expect(fetcher).toHaveBeenCalledTimes(3);
      await tick(1000);
      expect(fetcher).toHaveBeenCalledTimes(4);
    });

    it('stops polling when disabled or the interval is zero', async () => {
      const fetcher = jest.fn().mockResolvedValue('a');
      const { rerender } = renderPolling(fetcher);
      await tick(0);

      rerender({ id: 1, enabled: false, pollIntervalMs: 1000 });
      await tick(3000);
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(activeIntervals()).toBe(0);

      rerender({ id: 1, enabled: true, pollIntervalMs: 1000 });
      await tick(0);
      expect(fetcher).toHaveBeenCalledTimes(2);

      rerender({ id: 1, enabled: true, pollIntervalMs: 0 });
      await tick(3000);
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(activeIntervals()).toBe(0);
    });

    it('pauses while the tab is hidden and refreshes when visible', async () => {
      const fetcher = jest.fn().mockResolvedValue('a');
      renderPolling(fetcher);
      await tick(0);

      await setHidden(true);
      await tick(3000);
      expect(fetcher).toHaveBeenCalledTimes(1);

      await setHidden(false);
      expect(fetcher).toHaveBeenCalledTimes(2);
      await tick(1000);
      expect(fetcher).toHaveBeenCalledTimes(3);
    });

    it('keeps the data when a poll fails', async () => {
      const fetcher = jest
        .fn()
        .mockResolvedValueOnce('first')
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce('second');
      const { result } = renderPolling(fetcher);
      await tick(0);
      expect(result.current.data).toBe('first');

      await tick(1000);
      expect(result.current.data).toBe('first');
      expect(result.current.error).toBe('offline');

      await tick(1000);
      expect(result.current.data).toBe('second');
      expect(result.current.error).toBeNull();
    });

    it('polls without toggling loading', async () => {
      const next = deferred<string>();
      const fetcher = jest
        .fn()
        .mockResolvedValueOnce('first')
        .mockReturnValueOnce(next.promise);
      const { result } = renderPolling(fetcher);
      await tick(0);

      await tick(1000);
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(result.current.loading).toBe(false);

      await act(async () => {
        next.resolve('second');
        await next.promise;
      });
      expect(result.current.data).toBe('second');
    });

    it('skips a tick while a request is in flight', async () => {
      const pending = deferred<string>();
      const fetcher = jest.fn().mockReturnValue(pending.promise);
      renderPolling(fetcher);

      await tick(3000);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('drops a poll result when the caller edited the data meanwhile', async () => {
      const next = deferred<string>();
      const fetcher = jest
        .fn()
        .mockResolvedValueOnce('first')
        .mockReturnValueOnce(next.promise);
      const { result } = renderPolling(fetcher);
      await tick(0);

      await tick(1000);
      act(() => result.current.setData('edited'));
      await act(async () => {
        next.resolve('stale');
        await next.promise;
      });
      expect(result.current.data).toBe('edited');
    });

    it('does not clear an error set by the caller', async () => {
      const fetcher = jest.fn().mockResolvedValue('a');
      const { result } = renderPolling(fetcher);
      await tick(0);

      act(() => result.current.setError('Delete failed'));
      await tick(1000);
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBe('Delete failed');
    });
  });
});
