import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  LookupsProvider,
  createLookupStore,
  useLookup,
  useLookups,
  useOnLookupInvalidate,
} from '../LookupsContext';
import { getTaskStatuses, getPriorities } from '../../api/tasks';
import { getUserOptions } from '../../api/users';

jest.mock('../../api/tasks');
jest.mock('../../api/users');
jest.mock('../../api/projects');
jest.mock('../../api/roles');
jest.mock('../../api/tags');
jest.mock('../../api/taskTypes');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LookupsProvider>{children}</LookupsProvider>
);

const statuses = [{ id: 1, name: 'New' }];

describe('LookupsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getTaskStatuses as jest.Mock).mockResolvedValue(statuses);
    (getPriorities as jest.Mock).mockResolvedValue([]);
    (getUserOptions as jest.Mock).mockResolvedValue([
      { id: 1, login: 'jd', name: 'John', surname: 'Doe' },
    ]);
  });

  it('shares one request between consumers of the same key', async () => {
    const { result } = renderHook(
      () => ({ a: useLookup('statuses'), b: useLookup('statuses') }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.a.loading).toBe(false));
    expect(result.current.a.data).toEqual(statuses);
    expect(result.current.b.data).toEqual(statuses);
    expect(getTaskStatuses).toHaveBeenCalledTimes(1);
  });

  it('loads user pickers from the options endpoint', async () => {
    const { result } = renderHook(() => useLookup('users'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getUserOptions).toHaveBeenCalledTimes(1);
    expect(result.current.data[0].login).toBe('jd');
  });

  it('refetches only the invalidated key', async () => {
    const { result } = renderHook(
      () => ({
        store: useLookups(),
        statuses: useLookup('statuses'),
        priorities: useLookup('priorities'),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.statuses.loading).toBe(false));

    act(() => result.current.store.invalidate('statuses'));

    await waitFor(() => expect(getTaskStatuses).toHaveBeenCalledTimes(2));
    expect(getPriorities).toHaveBeenCalledTimes(1);
  });

  it('retries after a failed request', async () => {
    (getTaskStatuses as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 403, data: {} },
    });
    const store = createLookupStore();

    await expect(store.get('statuses')).rejects.toBeDefined();
    await expect(store.get('statuses')).resolves.toEqual(statuses);
    expect(getTaskStatuses).toHaveBeenCalledTimes(2);
  });

  it('exposes the load error', async () => {
    (getTaskStatuses as jest.Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 403, data: {} },
    });
    const { result } = renderHook(() => useLookup('statuses'), { wrapper });

    await waitFor(() =>
      expect(result.current.error).toBe(
        'You do not have permission to perform this action',
      ),
    );
    expect(result.current.loading).toBe(false);
  });

  it('notifies invalidate listeners for their key and for clear-all', () => {
    const callback = jest.fn();
    const { result } = renderHook(
      () => useOnLookupInvalidate('users', callback),
      { wrapper },
    );

    act(() => result.current.invalidate('tags'));
    expect(callback).not.toHaveBeenCalled();
    act(() => result.current.invalidate('users'));
    act(() => result.current.invalidate());
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
