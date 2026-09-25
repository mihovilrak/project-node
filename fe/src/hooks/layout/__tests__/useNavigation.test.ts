import { renderHook } from '@testing-library/react';
import { useNavigation, getNavTab } from '../useNavigation';
import { useLocation } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

describe('useNavigation', () => {
  it.each([
    ['/', '/'],
    ['/home', '/'],
    ['/projects', '/projects'],
    ['/projects/123', '/projects'],
    ['/projects/new', '/projects'],
    ['/projects/2/time-logs/calendar', '/projects'],
    ['/tasks', '/tasks'],
    ['/tasks/123/edit', '/tasks'],
    ['/calendar', '/calendar'],
    ['/users', '/users'],
    ['/users/123', '/users'],
    ['/settings', '/settings'],
  ])('maps %s to the %s tab', (pathname, expected) => {
    (useLocation as jest.Mock).mockReturnValue({ pathname });
    const { result } = renderHook(() => useNavigation());
    expect(result.current.activeTab).toBe(expected);
  });

  it.each(['/profile', '/login', '/tasksx'])(
    'has no active tab for %s',
    (pathname) => {
      expect(getNavTab(pathname)).toBe(false);
    },
  );
});
