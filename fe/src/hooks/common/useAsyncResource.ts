import {
  DependencyList,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AsyncResource, AsyncResourceOptions } from '../../types/common';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

/**
 * Runs `fetcher` whenever `deps` change, aborting the in-flight request on
 * cleanup so a stale response can never overwrite fresher state.
 *
 * With `pollIntervalMs` it also refetches on that interval while the tab is
 * visible. Polls keep the current data when they fail and do not clear an error
 * set by the caller.
 */
export const useAsyncResource = <T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
  options: AsyncResourceOptions<T>,
): AsyncResource<T> => {
  const { initialData, enabled = true, errorMessage, pollIntervalMs } = options;

  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setErrorState] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const initialDataRef = useRef(initialData);
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  // True while `error` came from a failed fetch rather than from setError.
  const loadErrorRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const setError = useCallback((value: SetStateAction<string | null>) => {
    loadErrorRef.current = false;
    setErrorState(value);
  }, []);

  const run = useCallback(
    async (isPoll: boolean): Promise<void> => {
      // A late refetch (e.g. after an awaited mutation) must not start a
      // request nobody will abort.
      if (!mountedRef.current) return;
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      if (!isPoll) {
        loadErrorRef.current = false;
        setErrorState(null);
      }
      try {
        const result = await fetcherRef.current(controller.signal);
        if (controller.signal.aborted) return;
        setData(result);
        if (loadErrorRef.current) {
          loadErrorRef.current = false;
          setErrorState(null);
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        logger.error(errorMessage ?? 'Failed to load data:', err);
        if (!isPoll) setData(initialDataRef.current);
        loadErrorRef.current = true;
        setErrorState(
          getApiErrorMessage(err, errorMessage ?? 'Failed to load data'),
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [errorMessage],
  );

  const refetch = useCallback(() => run(false), [run]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    run(false);
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    if (!enabled || !pollIntervalMs || pollIntervalMs <= 0) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const poll = () => {
      void run(true);
    };
    const start = () => {
      if (!interval) interval = setInterval(poll, pollIntervalMs);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };
    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        poll();
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, pollIntervalMs, run, ...deps]);

  return { data, setData, loading, error, setError, refetch };
};

export default useAsyncResource;
