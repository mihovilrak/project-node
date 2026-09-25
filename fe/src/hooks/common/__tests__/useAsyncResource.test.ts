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
});
