import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTaskStatuses, getPriorities } from '../api/tasks';
import { getProjectStatuses } from '../api/projects';
import { getRoles } from '../api/roles';
import { getTags } from '../api/tags';
import { getTaskTypes } from '../api/taskTypes';
import { getUserOptions } from '../api/users';
import { TaskPriority, TaskStatus, TaskType } from '../types/task';
import { ProjectStatus } from '../types/project';
import { Role } from '../types/role';
import { Tag } from '../types/tag';
import { UserOption } from '../types/user';
import getApiErrorMessage from '../utils/getApiErrorMessage';
import logger from '../utils/logger';

export interface LookupMap {
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  projectStatuses: ProjectStatus[];
  roles: Role[];
  tags: Tag[];
  types: TaskType[];
  users: UserOption[];
}

export type LookupKey = keyof LookupMap;

const fetchers: { [K in LookupKey]: () => Promise<LookupMap[K]> } = {
  statuses: () => getTaskStatuses(),
  priorities: () => getPriorities(),
  projectStatuses: () => getProjectStatuses(),
  roles: () => getRoles(),
  tags: () => getTags(),
  types: () => getTaskTypes(),
  users: () => getUserOptions(),
};

type Listener = () => void;

export interface LookupStore {
  get: <K extends LookupKey>(key: K) => Promise<LookupMap[K]>;
  invalidate: (key?: LookupKey) => void;
  subscribe: (listener: Listener) => () => void;
}

export const createLookupStore = (): LookupStore => {
  const cache = new Map<LookupKey, Promise<unknown>>();
  const listeners = new Set<Listener>();

  const get = <K extends LookupKey>(key: K): Promise<LookupMap[K]> => {
    let promise = cache.get(key) as Promise<LookupMap[K]> | undefined;
    if (!promise) {
      promise = fetchers[key]().then((data) => data ?? ([] as LookupMap[K]));
      // Drop failed requests so the next consumer retries.
      promise.catch(() => {
        if (cache.get(key) === promise) cache.delete(key);
      });
      cache.set(key, promise);
    }
    return promise;
  };

  const invalidate = (key?: LookupKey) => {
    if (key) cache.delete(key);
    else cache.clear();
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return { get, invalidate, subscribe };
};

const LookupsContext = createContext<LookupStore | null>(null);

export const LookupsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [store] = useState(createLookupStore);
  return (
    <LookupsContext.Provider value={store}>{children}</LookupsContext.Provider>
  );
};

/**
 * Access the shared lookup store. Without a provider each caller gets its own
 * uncached store so components still work in isolation.
 */
export const useLookups = (): LookupStore => {
  const store = useContext(LookupsContext);
  const [fallback] = useState(() => (store ? null : createLookupStore()));
  return (store ?? fallback) as LookupStore;
};

export interface LookupState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

const EMPTY: never[] = [];

/**
 * Subscribe to a single lookup list. Data is fetched once per provider and
 * refetched after `invalidate(key)`.
 */
export const useLookup = <K extends LookupKey>(
  key: K,
  enabled = true,
): LookupState<LookupMap[K]> => {
  const store = useLookups();
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<LookupState<LookupMap[K]>>({
    data: EMPTY as unknown as LookupMap[K],
    loading: enabled,
    error: null,
  });

  useEffect(() => store.subscribe(() => setVersion((v) => v + 1)), [store]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    store.get(key).then(
      (data) => {
        if (active) setState({ data, loading: false, error: null });
      },
      (error: unknown) => {
        if (!active) return;
        logger.error(`Failed to load ${key}:`, error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: getApiErrorMessage(error, `Failed to load ${key}`),
        }));
      },
    );
    return () => {
      active = false;
    };
  }, [store, key, enabled, version]);

  return state;
};
